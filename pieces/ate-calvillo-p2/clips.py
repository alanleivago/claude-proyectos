"""Genera los clips de ate-calvillo-p2 PARTE 2 (El Ate de Calvillo · Parte 2, MEXI STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1 ("el lunes te presentas en la empacadora: ya es hora de que conozcas a tu patrón"): Eleazar, pálido, pregunta si la empacadora es de su padre.
Desenlace del giro: Cleofas la compró con la guayaba del cañón y él mismo pidió que le dieran el puesto a su hijo; el lunes Eleazar empieza desde abajo, cortando guayaba en la huerta de su hermana.
Castigo de la villana: cuaja el ate, se acabó el plazo, la camioneta se queda y Marcela se va a pie en tacones a la central de camiones (como lo mandaron a él). Eleazar se queda, pide perdón
y Cleofas lo perdona sin cambiar su decisión. Gancho para la Parte 3: Marcela al teléfono, "el viejo no sabe lo que firmó Eleazar".
Copia del clips.py de costal-cuyutlan-p2 (encuadres de Atrium: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one; y todas sus defensas: gatito en imagen, reload_flow, new_project,
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
# Gancho 0-2 s (c01, Eleazar hablando, sin plano previo de objetos): Eleazar, pálido junto al portón: "¿Mi patrón? ¿La empacadora es suya, apá? Yo llevo años de gerente ahí."
# (recordatorio del gancho de la P1: la camioneta a nombre del padre y "el lunes conoces a tu patrón").
# Capas: la empacadora es de Cleofas y él pidió el puesto para su hijo (c02) -> lo probó con poder y lo usó para subirlo a un camión (c04) -> el lunes empieza desde abajo, cortando guayaba (c06)
# -> Marcela contra Gertrudis (c07-c10) -> cuaja el ate (i01, c11): se acabó el plazo, las llaves en la mesa (c12) -> Marcela, a la central en camión, como lo mandaron a él (c13-c14)
# -> Eleazar se queda (c16) y Marcela se va a pie en tacones (r3) -> perdón sin cambiar la decisión (c18-c19) -> se quita el reloj y carga guayaba (r4, r5) -> cálida (c20-c22)
# -> gancho: Marcela al teléfono en la calle, "el viejo no sabe lo que firmó Eleazar" (c23) -> CTA de Cleofas (c24).
# Geografía fija (patio de la casita de adobe de Gertrudis, la misma de la P1): fogón con el cazo a la IZQUIERDA (Gertrudis meneando, Cleofas junto al fogón, a la derecha de su hija);
# portón verde a la DERECHA (Marcela con su bolsa blanca, Eleazar a la derecha de su esposa). La llave negra de la camioneta ya está en la mesita, junto a Cleofas (fin de la P1).
# Sin personajes nuevos (no hace falta plano de presentación). CTA (c24): Cleofas solo junto al cazo, a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: el inserto va solo en medio.
PAT0 = ("in the small backyard of a humble ochre adobe house in Calvillo, Aguascalientes @{LOC_ATECALVILLO} in the late afternoon: a wood-fired adobe stove with a big copper cauldron, "
        "woven baskets full of yellow guavas, a green iron gate open to a dirt street, guava trees behind, warm golden light; no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
STREET = ("on the dirt street just outside the open green iron gate of a humble ochre adobe house in Calvillo, Aguascalientes @{LOC_ATECALVILLO} at dusk, warm orange light, "
          "guava trees over the adobe wall; no readable text, no signs, no logos; nobody else on the street, no extras, nobody besides the person described")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual (la misma de la P1).
CAULDRON = "a big copper cauldron of thick bubbling pink guava paste on a wood-fired adobe stove"
PADDLE = "a long wooden paddle"
HAT = "a light straw palm hat"
KEY = "a black pickup truck key"
BAG = "a small white handbag"
TRUCK = "a dark grey double-cab pickup truck"
BASKET = "a woven basket full of yellow guavas"
PHONE = "a plain black phone"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py). Solo Cleofas sombrero de palma, bigote blanco y paliacate rojo (figura de autoridad);
# solo Marcela pelirroja (castaño rojizo lacio) con blusa verde esmeralda de satín y lentes de sol en la cabeza (villana);
# solo Eleazar cabeza rapada, candado negro y polo vino (traidor); solo Gertrudis trenza negra, blusa azul cielo y mandil rosa.
CLE = ("@{CLEOFAS_ELIZALDE} (74-year-old Mexican man, lean and weathered, deep-tanned wrinkled skin, a thick white mustache, short white hair, a light straw palm hat, "
       "a long-sleeve brown-and-cream plaid shirt, a red bandana knotted at his neck, faded blue jeans, brown leather boots)")
GER = ("@{GERTRUDIS_ELIZALDE} (41-year-old Mexican woman, brown skin, thin face, a single long black braid, a plain light-blue cotton blouse with rolled sleeves, "
       "a plain pink apron, a long navy-blue skirt, black flat shoes)")
MAR = ("@{MARCELA_COLLADO} (44-year-old Mexican woman, fair skin, long straight auburn-red hair, big dark sunglasses pushed up on her head, red lipstick, "
       "an emerald-green satin blouse, white jeans, nude high heels, a small white handbag)")
ELE = ("@{ELEAZAR_ELIZALDE} (48-year-old Mexican man, stocky, brown skin, a shaved head, a short black goatee, a wine-red polo shirt, khaki trousers, "
       "brown loafers, a big gold wristwatch)")
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"DIALOGUE (exact Spanish words, nothing else): {who} says {said} {desc} {who} {VOICE}, {tone}. {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

# Encuadres tipo Atrium (fuentes/atrium-vista/encuadres.md): OTS ~50 %, single ~25 %, two-shot ~15 %, grupo ~10 %.
# La persona de espaldas va con su @{ASSET} + pelo y ropa vistos desde atrás (así Omni no mete un doble ni un desconocido).
# Cada clip OTS/two/grupo es una tupla (prompt_nuevo, prompt_one): desde el intento ONE_FROM+1 (4-6) o con --one vuelve al single.
# Bordes (geografía fija): los de la izquierda (Cleofas, Gertrudis) le hablan a Marcela o a Eleazar -> espalda de ellos en el borde RIGHT;
# Marcela o Eleazar le hablan a los de la izquierda -> espalda del otro en el borde LEFT; Marcela le habla a Eleazar -> espalda de Eleazar en el borde RIGHT;
# Gertrudis le habla a su papá -> espalda de Cleofas en el borde RIGHT; Cleofas le habla a Gertrudis -> espalda de Gertrudis en el borde LEFT.
CLE_B = "@{CLEOFAS_ELIZALDE} seen from behind (light straw palm hat, brown-and-cream plaid shirt, the knot of a red bandana at the back of his neck, lean)"
GER_B = "@{GERTRUDIS_ELIZALDE} seen from behind (a long black braid down her back, light-blue blouse, the ties of a pink apron at her back)"
MAR_B = "@{MARCELA_COLLADO} seen from behind (long straight auburn-red hair, dark sunglasses on top of her head, emerald-green satin blouse)"
ELE_B = "@{ELEAZAR_ELIZALDE} seen from behind (shaved head, wine-red polo shirt, stocky)"
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

CL = f"standing on the LEFT beside the wood-fired adobe stove, wearing {HAT}"                       # Cleofas
GL = f"standing on the LEFT at the wood-fired adobe stove, stirring {CAULDRON} with {PADDLE}"        # Gertrudis
MR = f"standing on the RIGHT by the open green iron gate, {BAG} on her arm"                         # Marcela
ER = "standing on the RIGHT by the open green iron gate, his hands empty"                           # Eleazar (la llave ya la tiene su padre)

CLIPS = [
 # 1. Gancho (0-2 s): Eleazar YA hablando, pálido; Cleofas de espaldas a la izquierda
 ("c01", D8("c01"), (talk("c01", "Eleazar", ots(f"Medium close-up of {ELE} {PAT0}, {ER}, talking from the very first frame, pale and stunned, his voice cracking", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "stunned, disbelieving"),
   talk("c01", "Eleazar", one(f"Medium close-up of {ELE} {PAT}, {ER}, talking from the very first frame, pale and stunned, his voice cracking", "LEFT"), "stunned, disbelieving"))),
 ("c02", D8("c02"), (talk("c02", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, calm and powerful, a slow nod", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "calm, powerful, slow"),
   talk("c02", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, calm and powerful, a slow nod", "RIGHT"), "calm, powerful, slow"))),
 ("c03", D8("c03"), (talk("c03", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, indignant, she pulls her sunglasses down from her head", CLE_B, "LEFT") + " " + MOUTH("Marcela", "Cleofas"),
     "indignant, sharp"),
   talk("c03", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, indignant, she pulls her sunglasses down from her head", "LEFT"), "indignant, sharp"))),
 # c04: la herida, single de Cleofas
 ("c04", D8("c04"), talk("c04", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, sad and firm, his eyes shine under the brim of his straw hat", "RIGHT"),
     "sad, firm, quiet")),
 # r1 grupo mudo: la noticia cae sobre los cuatro
 ("r1", 6, (f"Medium wide shot from the knees up {PAT0}: on the LEFT {GER} {GL}, the paddle stopped, and {CLE} {CL} beside her; on the RIGHT by the open green iron gate "
            f"{MAR} with her handbag on her arm, frozen, and {ELE} on her right, staring at the ground; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ELE} {PAT}, {ER}, in silence, pale, he stares at the ground", "LEFT") + " Slow push-in. No dialogue.")),
 # 2. Desenlace del giro: desde abajo
 ("c05", 6, (talk("c05", "Eleazar", ots(f"Close-up of {ELE} {PAT0}, {ER}, alarmed and pleading", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "alarmed, pleading"),
   talk("c05", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, alarmed and pleading", "LEFT"), "alarmed, pleading"))),
 ("c06", D8("c06"), (talk("c06", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, firm and calm, he nods toward the baskets of yellow guavas", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "firm, calm, final"),
   talk("c06", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, firm and calm", "RIGHT"), "firm, calm, final"))),
 ("c07", D8("c07"), (talk("c07", "Marcela", two(f"{MAR} on the LEFT in profile facing right and {ELE} on the RIGHT in profile facing left, a meter apart by the open green iron gate {PAT0}, framed from the waist up; "
            f"Marcela, outraged, slightly closer to the camera and in sharper focus") + " " + MOUTH("Marcela", "Eleazar"),
     "outraged, mocking"),
   talk("c07", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, outraged", "RIGHT"), "outraged, mocking"))),
 ("c08", D8("c08"), (talk("c08", "Gertrudis", ots(f"Close-up of {GER} {PAT0}, {GL}, calm, a small proud smile", MAR_B, "RIGHT") + " " + MOUTH("Gertrudis", "Marcela"),
     "calm, proud, gentle"),
   talk("c08", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL}, calm, a small proud smile", "RIGHT"), "calm, proud, gentle"))),
 ("c09", D8("c09"), (talk("c09", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, venomous, she lifts her chin at the cauldron", GER_B, "LEFT") + " " + MOUTH("Marcela", "Gertrudis"),
     "venomous, cold"),
   talk("c09", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, venomous, she lifts her chin", "LEFT"), "venomous, cold"))),
 ("c10", D8("c10"), (talk("c10", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, firm and dry, he steps half in front of his daughter", MAR_B, "RIGHT") + " " + MOUTH("Cleofas", "Marcela"),
     "firm, dry"),
   talk("c10", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, firm and dry", "RIGHT"), "firm, dry"))),
 # i01: el ate ya cuajó (el plazo se cumple)
 ("i01", 6, f"Close-up insert {PAT0}: inside {CAULDRON.replace('thick bubbling', 'now thick and set')}, the dark pink guava paste glossy and still, {PADDLE} standing upright stuck in it, no longer moving; "
            f"only the cauldron and the paddle, no people, no hands, no letters. No dialogue."),
 # 3. Castigo de la villana: cuaja el ate, las llaves, en camión
 ("c11", 6, (talk("c11", "Gertrudis", two(f"{GER} on the LEFT at the wood-fired adobe stove and {CLE} on the RIGHT beside her, in profile facing each other {PAT0}, framed from the waist up; "
            f"Gertrudis lets go of the wooden paddle and it stays upright in the thick paste, she looks up at her father, surprised, slightly closer to the camera and in sharper focus") + " " + MOUTH("Gertrudis", "Cleofas"),
     "surprised, soft"),
   talk("c11", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL.replace('stirring', 'beside')}, surprised, she looks at the cauldron", "RIGHT"), "surprised, soft"))),
 ("c12", D8("c12"), talk("c12", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, calm and final, he glances down at {KEY} on the small wooden table beside him", "RIGHT"),
     "calm, final, powerful")),
 ("c13", D8("c13"), talk("c13", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, outraged and cornered, she looks down at her nude high heels and the dirt street", "LEFT"),
     "outraged, cornered")),
 ("c14", 6, (talk("c14", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, a dry ironic half smile, he lifts his chin toward the street", MAR_B, "RIGHT") + " " + MOUTH("Cleofas", "Marcela"),
     "dry, ironic, calm"),
   talk("c14", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, a dry ironic half smile", "RIGHT"), "dry, ironic, calm"))),
 # r2 grupo mudo: Marcela mira la camioneta que ya no es suya
 ("r2", 6, (f"Medium wide shot from the knees up {PAT0}: on the RIGHT by the open green iron gate {MAR}, frozen, clutching her handbag, looking back at {TRUCK} parked on the street, "
            f"and {ELE} on her right, looking down; on the LEFT {CLE} {CL} and {GER} at the stove, watching calmly; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {MAR} {PAT}, {MR}, in silence, frozen, she clutches her handbag", "LEFT") + " Slow push-in. No dialogue.")),
 ("c15", 6, (talk("c15", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, she turns to her husband, desperate", ELE_B, "RIGHT") + " " + MOUTH("Marcela", "Eleazar"),
     "desperate, bossy"),
   talk("c15", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, desperate", "RIGHT"), "desperate, bossy"))),
 # c16: Eleazar elige quedarse (single)
 ("c16", 6, talk("c16", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, his eyes shine, quiet and decided, for the first time he does not look away", "LEFT"),
     "quiet, decided, sincere")),
 ("c17", D8("c17"), (talk("c17", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, hurt and furious, she puts her sunglasses back on", ELE_B, "RIGHT") + " " + MOUTH("Marcela", "Eleazar"),
     "hurt, furious, cold"),
   talk("c17", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, hurt and furious, she puts her sunglasses back on", "RIGHT"), "hurt, furious, cold"))),
 # r3: Marcela se va a pie, en tacones, por la calle de tierra (de espaldas, con su ropa)
 ("r3", 6, f"Medium shot {STREET}: {MAR_B} walks away along the dirt street, already in frame from the first frame, wobbling on her nude high heels over the stones, "
           f"her small white handbag on her arm, her white jeans dusty; the only person in the shot, {SOLO}. No dialogue."),
 # 4. Perdón sin cambiar la decisión
 ("c18", D8("c18"), (talk("c18", "Eleazar", ots(f"Close-up of {ELE} {PAT0}, {ER}, his eyes fill with tears, ashamed, his voice breaks", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "ashamed, broken, sincere"),
   talk("c18", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, he is the BALD man with a completely shaved head and a short black goatee in a wine-red polo (NOT curly hair, NOT a green shirt), his eyes shine, ashamed", "LEFT"), "ashamed, sincere, steady voice"))),
 ("c19", D8("c19"), (talk("c19", "Cleofas", two(f"{CLE} on the LEFT beside the adobe stove in profile facing right and {ELE} on the RIGHT in profile facing left, a meter apart {PAT0}, framed from the waist up; "
            f"Cleofas, tender and firm, rests one hand on his son's shoulder, slightly closer to the camera and in sharper focus") + " " + MOUTH("Cleofas", "Eleazar"),
     "tender, firm, slow"),
   talk("c19", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, tender and firm", "RIGHT"), "tender, firm, slow"))),
 # r4 two-shot mudo: Eleazar se quita el reloj dorado
 ("r4", 6, (two(f"{CLE} on the LEFT beside the adobe stove, watching, and {ELE} on the RIGHT by the gate, who takes off his big gold wristwatch and puts it in his trouser pocket {PAT0}, framed from the knees up") + " Slow push-in. " + MUTE,
   one(f"Close-up of {ELE} {PAT}, {ER}, in silence, he takes off his big gold wristwatch and puts it in his pocket", "LEFT") + " Slow push-in. No dialogue.")),
 # 5. Cálida: Gertrudis, Cleofas y el hermano que empieza desde abajo
 ("c20", D8("c20"), (talk("c20", "Gertrudis", ots(f"Close-up of {GER} {PAT0}, {GL}, a warm half smile, she nods at the baskets of yellow guavas", ELE_B, "RIGHT") + " " + MOUTH("Gertrudis", "Eleazar"),
     "warm, a little playful"),
   talk("c20", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL}, a warm half smile", "RIGHT"), "warm, a little playful"))),
 ("c21", D8("c21"), (talk("c21", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, tender, his eyes shine, he looks at his daughter", GER_B, "LEFT") + " " + MOUTH("Cleofas", "Gertrudis"),
     "tender, moved, warm"),
   talk("c21", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, tender, his eyes shine", "LEFT"), "tender, moved, warm"))),
 ("c22", 6, (talk("c22", "Gertrudis", ots(f"Close-up of {GER} {PAT0}, {GL}, a shy warm smile", CLE_B, "RIGHT") + " " + MOUTH("Gertrudis", "Cleofas"),
     "warm, simple, sincere"),
   talk("c22", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL}, a shy warm smile", "RIGHT"), "warm, simple, sincere"))),
 # r5 grupo mudo: Eleazar carga una canasta de guayabas, padre e hija lo miran
 ("r5", 6, (f"Medium wide shot from the knees up {PAT0}: on the RIGHT {ELE} lifts {BASKET} onto his shoulder, bent under the weight, sweating; "
            f"on the LEFT {GER} {GL} and {CLE} {CL} beside her watch him with small smiles; only these three people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {ELE} {PAT}, on the RIGHT by the gate, {BASKET} on his shoulder, bent under the weight, sweating, {SOLO}; {ALONE}. No dialogue.")),
 # 6. Gancho: Marcela sola en la calle, al teléfono (single)
 ("c23", 6, talk("c23", "Marcela", one(f"Close-up of {MAR} {STREET}, she holds {PHONE} to her ear, she glances back over her shoulder at the green gate with a cold secretive smile", "LEFT"),
     "low, whispering, secretive")),
 # CTA con carisma (después del BLACK): Cleofas solo junto al cazo, a cámara
 ("c24", 10, talk("c24", "Cleofas", f"Close-up from the chest up of {CLE} {PAT0}, alone beside the copper cauldron, holding {KEY}, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a sly little smile, makes a short pause, raises one eyebrow, "
     f"taps the brim of his straw hat, tastes a bit of guava paste from the wooden paddle, tilts his head, nods and winks. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"furious" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y lo usó para subirme a un camión.", "Y me falló."), ("¿Mi marido, cortando guayaba como peón?", "¿Mi marido, cortando guayaba?"),
        ("Tú cállate, que ya te quedaste con todo.", "Tú no opines, que ya tienes todo."), ("Te vas a acordar de este día, Eleazar.", "Ya hablaremos, Eleazar."),
        ("Ya me corrieron, comadre.", "Ya me fui, comadre."), ("Pero el viejo no sabe lo que firmó Eleazar.", "Pero mi suegro no sabe lo que firmó Eleazar."),
        ("his voice breaks", "quietly"), ("his voice cracking", "quietly"), ("bent under the weight", "walking slowly"), ("wobbling", "walking"), ("venomous", "calm"),
        ("outraged", "surprised"), ("cornered", "serious"), ("desperate", "worried"), ("broken", "quiet"), ("bossy", "firm"), ("secretive", "thoughtful"), ("whispering", "talking softly"),
        ("sly", "warm"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("stunned", "surprised"), ("alarmed", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"),
        ("dismissive", "calm"), ("bitter", "quiet"), ("proud", "calm"), ("cold", "serious"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "sunglasses"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm golden late-afternoon light in a humble adobe backyard among the guava orchards of Calvillo, Aguascalientes, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, small backyard of an adobe house with a wood-fired stove and a copper cauldron in rural Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CLEOFAS_ELIZALDE}", "a lean weathered old Mexican man with a thick white mustache, a light straw palm hat, a brown-and-cream plaid shirt and a red bandana at his neck"),
         ("@{GERTRUDIS_ELIZALDE}", "a thin Mexican woman around forty with a long black braid, a light-blue blouse and a pink apron"),
         ("@{MARCELA_COLLADO}", "a Mexican woman in her forties with long straight auburn-red hair, sunglasses on her head and an emerald-green satin blouse"),
         ("@{ELEAZAR_ELIZALDE}", "a stocky Mexican man in his late forties with a shaved head, a short black goatee and a wine-red polo shirt"),
         (" @{LOC_ATECALVILLO}", "")]
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
