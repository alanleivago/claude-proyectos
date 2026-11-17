"""Genera los clips de jipi-becal-p2 PARTE 2 (La Cueva de Bécal · Parte 2, MEXI STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1 (Zoraida le llama a su hijo a escondidas): ahora es ella la que teje en la cueva y le pide a Lisandro que venga a sacarla; Lisandro baja un día antes de la plataforma,
descubre que los mensajes de "ya no me busques" los mandaba su madre desde el celular de Nicté, le quita el celular a ella ("para que rindas") y la abuela la manda al cuartito de la palma.
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
# Gancho 0-2 s (c01, Zoraida hablando, sin plano previo de objetos): Zoraida, con su blusa de leopardo, sentada en el banquito de la cueva con un sombrero a medio tejer, susurra al celular dorado:
# "Mijo, tu abuela me tiene tejiendo en la cueva. Vente hoy mismo y sácame de aquí." (recordatorio breve: el castigo del sábado y la llamada a escondidas del final de la P1).
# Capas: Lisandro llega un día antes (r1, presentación) -> Zoraida sube y se hace la víctima (c04-c06) -> sale Nicté (r2) -> los mensajes de "ya no me busques" (c08)
# -> el celular rosa en la bolsita de Zoraida (c10, i02) -> los mensajes salían de noche y luego llamaba ella (c11): desenlace del giro -> "lo hice por tu bien" (c12)
# -> castigo: Lisandro le quita el celular dorado "para que rindas" (c17, i03); la abuela le da el cuartito de la palma y el petate (c20-c22); Nicté deja la escalera abajo (c23); Zoraida baja a la cueva (r4)
# -> reconciliación (c24-c26) -> gancho: Zoraida en la cueva, "ya van a ver quién teje a quién" (c27) -> CTA de Nicté (c28).
# Geografía fija del patio (toda la escena): boca de la cueva, silla de plástico y Zoraida a la IZQUIERDA; Lisandro en MEDIO, bajo el árbol; Nicté y la abuela a la DERECHA, bajo los arcos del corredor
# (Nicté siempre a la izquierda de la abuela). La escalera está metida en la boca de la cueva TODO el video.
# Personaje nuevo: Lisandro (presentación en r1, two-shot con la abuela). CTA (c28): Nicté sola bajo los arcos, a cámara. Sin Navidad. Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
CAVE0 = ("inside a small natural limestone cave under a backyard in Bécal, Campeche @{LOC_CUEVABECAL}: rough pale limestone walls glistening with humidity, a single shaft of daylight falling from a round opening in the rock ceiling, "
         "a low wooden stool, bundles of pale cream palm fibers hanging from a cord on the wall, a dim and humid atmosphere; no readable text, no signs, no logos")
CAVE = CAVE0 + "; nobody else in the cave, no extras, nobody besides the person described"
YARD0 = ("in the backyard of a pale pink house in Bécal, Campeche @{LOC_PATIOBECAL} in bright late-morning light: a white limestone wall, a big leafy tree giving shade, "
         "a round cave opening in the ground with a low stone rim on the LEFT, a white plastic chair beside it, a corridor of arches of the pink house on the RIGHT, bundles of pale palm fibers drying on a rope; "
         "no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
LADDER = "a plain wooden ladder"
HAT = "an unfinished pale cream palm hat on a wooden hat mold"
PINK = "a small phone in a cracked pink case with its screen dark"
GOLD = "a phone in a shiny gold case with its screen dark"
BAG = "a navy-blue canvas duffel bag"
DOWN = f"{LADDER} standing inside the cave opening, its top sticking out"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py) + Lisandro. Solo Apolonia pelo blanco, huipil blanco bordado, rebozo negro y bastón; solo Zoraida pelo vino, lentes de carey en la cabeza,
# blusa de leopardo y abanico negro; solo Nicté vestido azul cielo deslavado, mandil beige y dedos vendados; solo Lisandro hombre joven, playera gris jaspeada y jeans.
APO = ("@{APOLONIA_CHABLE} (81-year-old Maya Mexican woman, deep brown wrinkled skin, small and thin but upright, white hair in a low bun, small gold earrings, "
       "a white embroidered huipil dress with bands of red and green flowers at the square neckline and hem, a black rebozo over her shoulders, a dark wooden cane in her RIGHT hand)")
ZOR = ("@{ZORAIDA_CANUL} (56-year-old Mexican woman, light-brown skin, plump, short teased hair dyed burgundy red, big tortoiseshell sunglasses pushed up on her head, red lipstick, "
       "a leopard-print blouse, white capri pants, gold sandals, many gold bangles on both wrists, a black lace folding fan in her RIGHT hand, a small gold handbag hanging from her LEFT shoulder)")
NIC = ("@{NICTE_UCAN} (27-year-old adult Maya Mexican woman, brown skin, slim, black hair pulled back in a low bun with a few loose strands, no makeup, "
       "a faded sky-blue cotton dress, a beige apron with two front pockets, her fingers wrapped in strips of white cloth tape, plain brown sandals)")
LIS = ("@{LISANDRO_PECH} (30-year-old Maya Mexican man, sun-tanned brown skin, tall and strong, short black hair, clean-shaven, a plain heather-grey t-shirt, "
       "dark blue jeans, brown work boots)")
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
# Bordes (geografía fija): Lisandro le habla a su madre -> espalda de Zoraida en el borde LEFT; Lisandro le habla a Nicté o a la abuela -> espalda de ellas en el borde RIGHT;
# Zoraida le habla a cualquiera -> espalda del otro en el borde RIGHT; Nicté o la abuela le hablan a Lisandro o a Zoraida -> espalda del otro en el borde LEFT.
ZOR_B = "@{ZORAIDA_CANUL} seen from behind (short teased burgundy-red hair with tortoiseshell sunglasses on top, leopard-print blouse, small gold handbag on her left shoulder)"
APO_B = "@{APOLONIA_CHABLE} seen from behind (small and thin, white hair in a low bun, black rebozo over a white huipil)"
NIC_B = "@{NICTE_UCAN} seen from behind (black hair in a low bun with loose strands, faded sky-blue dress, beige apron strings tied at the back)"
LIS_B = "@{LISANDRO_PECH} seen from behind (short black hair, broad shoulders, heather-grey t-shirt)"
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

ZL = f"standing on the LEFT beside the white plastic chair at the stone rim of the cave opening, {DOWN}"   # Zoraida (patio)
ZC = f"sitting on the low wooden stool under the shaft of daylight, {HAT} on her knees"                     # Zoraida (cueva)
LM = "standing in the middle of the patio under the leafy tree"                                             # Lisandro
AR = "standing on the RIGHT under the arches of the corridor"                                               # Apolonia
NR = "standing on the RIGHT under the arches of the corridor"                                               # Nicté
SPK = lambda spk: f"Only {spk} speaks: {spk}'s lips move clearly with every word; everyone else stays silent the whole shot with closed mouths, only listening."

CLIPS = [
 # 1. Gancho (0-2 s): Zoraida YA hablando en la cueva, a escondidas, con el celular dorado (llamada = single); recordatorio breve del castigo de la P1
 ("c01", 6, talk("c01", "Zoraida", one(f"Medium close-up of {ZOR} {CAVE}, {ZC}, talking from the very first frame with {GOLD} pressed to her ear, whispering, scheming, "
     f"she glances up at the bright round opening in the rock ceiling to make sure nobody hears", "LEFT"), "whispering, scheming, annoyed")),
 # r1: presentación de Lisandro (personaje nuevo) como two-shot mudo con la abuela, ropa completa visible
 ("r1", 6, (two(f"{LIS} on the LEFT in profile facing right, {BAG} hanging from his shoulder, just arrived, and {APO} on the RIGHT under the arches in profile facing left, about two meters apart {YARD0}, "
            f"framed from the knees up so both outfits show clearly; Lisandro looks around the patio, worried, then at his grandmother, slightly closer to the camera and in sharper focus") + " Slow push-in. " + MUTE,
   f"Medium shot of {LIS} {YARD}, {LM}, {BAG} hanging from his shoulder, just arrived, he looks around the patio, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey t-shirt')}. Slow push-in. No dialogue.")),
 ("c02", 6, (talk("c02", "Lisandro", ots(f"Close-up of {LIS} {YARD0}, {LM}, {BAG} on his shoulder, anxious, he glances toward the house", APO_B, "RIGHT") + " " + MOUTH("Lisandro", "Apolonia"),
     "anxious, tired, urgent"),
   talk("c02", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, {BAG} on his shoulder, anxious, he glances toward the house", "RIGHT"), "anxious, tired, urgent"))),
 ("c03", 6, (talk("c03", "Apolonia", ots(f"Close-up of {APO} {YARD0}, {AR}, calm and firm, leaning on her cane", LIS_B, "LEFT") + " " + MOUTH("Apolonia", "Lisandro"),
     "calm, firm, dry"),
   talk("c03", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, calm and firm, leaning on her cane", "LEFT"), "calm, firm, dry"))),
 ("i01", 6, f"Close-up insert {YARD0}: two hands with many gold bangles grip the top of {LADDER} sticking out of the round cave opening, a woman climbing up out of the cave; "
            f"only the hands, the bangles and the ladder, no face, no letters. No dialogue."),
 # 2. Zoraida sube y se hace la víctima
 ("c04", 6, (talk("c04", "Zoraida", ots(f"Close-up of {ZOR} {YARD0}, {ZL}, just climbed out of the cave, a little dusty, she opens her arms toward him with a theatrical relieved face", LIS_B, "RIGHT") + " " + MOUTH("Zoraida", "Lisandro"),
     "theatrical, relieved, whiny"),
   talk("c04", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZL}, just climbed out of the cave, a little dusty, she opens her arms with a theatrical relieved face", "RIGHT"), "theatrical, relieved, whiny"))),
 ("c05", D8("c05"), (talk("c05", "Lisandro", ots(f"Close-up of {LIS} {YARD0}, {LM}, serious and confused, he does not move toward her", ZOR_B, "LEFT") + " " + MOUTH("Lisandro", "Zoraida"),
     "serious, confused, hurt"),
   talk("c05", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, serious and confused, he does not move", "LEFT"), "serious, confused, hurt"))),
 ("c06", 6, (talk("c06", "Zoraida", ots(f"Close-up of {ZOR} {YARD0}, {ZL}, she waves her black fan dismissively toward the arches", LIS_B, "RIGHT") + " " + MOUTH("Zoraida", "Lisandro"),
     "dismissive, scheming"),
   talk("c06", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZL}, she waves her black fan dismissively toward the arches", "RIGHT"), "dismissive, scheming"))),
 # r2 grupo mudo: Nicté bajo los arcos y Lisandro voltea (geografía completa)
 ("r2", 6, (f"Medium wide shot from the knees up {YARD0}: on the RIGHT under the arches {NIC} stands still, rested, her fingers still wrapped in white cloth, she puts a hand on her chest when she sees him; "
            f"in the middle {LIS_B}, in three-quarter back view, turning toward her; on the LEFT {ZOR} by the cave opening, her smile freezing; only these three people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {NIC} {YARD}, {NR}, rested, her fingers still wrapped in white cloth, she puts a hand on her chest, moved, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a sky-blue dress')}. Slow push-in. No dialogue.")),
 ("c07", 6, (talk("c07", "Nicté", ots(f"Close-up of {NIC} {YARD0}, {NR}, her eyes shine, she can barely believe it", LIS_B, "LEFT") + " " + MOUTH("Nicté", "Lisandro"),
     "emotional, soft, hopeful"),
   talk("c07", "Nicté", one(f"Close-up of {NIC} {YARD}, {NR}, her eyes shine, she can barely believe it", "LEFT"), "emotional, soft, hopeful"))),
 ("c08", D8("c08"), (talk("c08", "Lisandro", two(f"{LIS} on the LEFT in profile facing right and {NIC} on the RIGHT under the arches in profile facing left, a meter apart {YARD0}, framed from the waist up; "
            f"Lisandro, hurt and confused, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lisandro", "Nicté"),
     "hurt, confused"),
   talk("c08", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, hurt and confused", "RIGHT"), "hurt, confused"))),
 ("c09", D8("c09"), (talk("c09", "Nicté", ots(f"Close-up of {NIC} {YARD0}, {NR}, firm, she shakes her head slowly", LIS_B, "LEFT") + " " + MOUTH("Nicté", "Lisandro"),
     "firm, sincere, hurt"),
   talk("c09", "Nicté", one(f"Close-up of {NIC} {YARD}, {NR}, firm, she shakes her head slowly", "LEFT"), "firm, sincere, hurt"))),
 # 3. El celular rosa y el desenlace del giro: los mensajes los mandaba Zoraida
 ("c10", 6, (talk("c10", "Apolonia", ots(f"Close-up of {APO} {YARD0}, {AR}, she holds up {PINK} in her LEFT hand, the cane in her RIGHT hand", LIS_B, "LEFT") + " " + MOUTH("Apolonia", "Lisandro"),
     "calm, firm"),
   talk("c10", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she holds up {PINK} in her LEFT hand, the cane in her RIGHT hand", "LEFT"), "calm, firm"))),
 ("i02", 6, f"Close-up insert {YARD0}: an old wrinkled brown hand places {PINK} into the open palm of a man's hand; only the two hands and the phone, no faces, no text on the screen. No dialogue."),
 ("c11", 6, talk("c11", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, he looks down at {PINK} in his hand, the screen facing away from the camera, then lifts his eyes slowly toward his mother, his jaw tightens", "LEFT"),
     "quiet, cold, hurt")),
 ("c12", 6, (talk("c12", "Zoraida", ots(f"Close-up of {ZOR} {YARD0}, {ZL}, she lifts her chin, unashamed, closing her black fan", LIS_B, "RIGHT") + " " + MOUTH("Zoraida", "Lisandro"),
     "self-righteous, cold"),
   talk("c12", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZL}, she lifts her chin, unashamed, closing her black fan", "RIGHT"), "self-righteous, cold"))),
 ("c13", 6, (talk("c13", "Lisandro", ots(f"Close-up of {LIS} {YARD0}, {LM}, his voice breaks, his eyes shine, he grips the pink phone", ZOR_B, "LEFT") + " " + MOUTH("Lisandro", "Zoraida"),
     "hurt, breaking"),
   talk("c13", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, his voice breaks, his eyes shine, he grips the pink phone", "LEFT"), "hurt, breaking"))),
 # c14 grupo: la abuela habla, los cuatro en su lugar
 ("c14", 6, (talk("c14", "Apolonia", f"Medium wide shot from the knees up {YARD0}: on the RIGHT under the arches {APO} speaks, leaning on her cane, firm, looking at the other woman; {NIC} beside her on her left, eyes down; "
            f"{LIS_B} in the middle in three-quarter back view; on the LEFT {ZOR} by the cave opening, {DOWN}; only these four people, no extras. " + SPK("Apolonia"),
     "firm, slow, severe"),
   talk("c14", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, firm, leaning on her cane", "LEFT"), "firm, slow, severe"))),
 ("c15", 6, (talk("c15", "Zoraida", ots(f"Close-up of {ZOR} {YARD0}, {ZL}, she puts on a sweet fake smile, her voice honeyed", NIC_B, "RIGHT") + " " + MOUTH("Zoraida", "Nicté"),
     "sweet, fake, pleading"),
   talk("c15", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZL}, she puts on a sweet fake smile, her voice honeyed", "RIGHT"), "sweet, fake, pleading"))),
 ("c16", 6, (talk("c16", "Nicté", ots(f"Close-up of {NIC} {YARD0}, {NR}, calm and dignified, her eyes shine but her voice is firm", ZOR_B, "LEFT") + " " + MOUTH("Nicté", "Zoraida"),
     "dignified, firm, hurt"),
   talk("c16", "Nicté", one(f"Close-up of {NIC} {YARD}, {NR}, calm and dignified, her eyes shine but her voice is firm", "LEFT"), "dignified, firm, hurt"))),
 ("r3", 6, one(f"Close-up of {ZOR} {YARD}, {ZL}, in silence, her fake smile falls slowly, she clutches her small gold handbag", "RIGHT") + " Slow push-in. No dialogue."),
 # 4. Castigo: el celular "para que rindas", el cuartito de la palma, la escalera abajo
 ("c17", 6, (talk("c17", "Lisandro", ots(f"Close-up of {LIS} {YARD0}, {LM}, he holds out his open hand toward her, calm and cold", ZOR_B, "LEFT") + " " + MOUTH("Lisandro", "Zoraida"),
     "calm, cold, ironic"),
   talk("c17", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, he holds out his open hand, calm and cold", "LEFT"), "calm, cold, ironic"))),
 ("i03", 6, f"Close-up insert {YARD0}: a hand with many gold bangles slowly places {GOLD} into a man's open palm; only the two hands and the phone, no faces, no text on the screen. No dialogue."),
 # c18 llanto (falso): single
 ("c18", 6, talk("c18", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZL}, her eyes fill with tears, theatrical, her red lips pout", "RIGHT"),
     "whiny, theatrical, crying")),
 ("c19", 6, (talk("c19", "Lisandro", two(f"{ZOR} on the LEFT by the cave opening, {DOWN}, and {LIS} on the RIGHT, in profile facing each other a meter apart {YARD0}, framed from the waist up; "
            f"Lisandro, sad and firm, puts the gold phone in his pocket, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lisandro", "Zoraida"),
     "sad, firm, low"),
   talk("c19", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, sad and firm, he puts the gold phone in his pocket", "LEFT"), "sad, firm, low"))),
 ("c20", 6, (talk("c20", "Apolonia", ots(f"Close-up of {APO} {YARD0}, {AR}, she taps her cane once on the ground, serene and final", ZOR_B, "LEFT") + " " + MOUTH("Apolonia", "Zoraida"),
     "serene, firm, final"),
   talk("c20", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she taps her cane once on the ground, serene and final", "LEFT"), "serene, firm, final"))),
 ("c21", 6, (talk("c21", "Zoraida", ots(f"Close-up of {ZOR} {YARD0}, {ZL}, offended, she fans herself fast with her black fan, wearing her leopard-print blouse and white capri pants exactly as in her reference sheet (NOT a white huipil, NOT a black shawl)", APO_B, "RIGHT") + " " + MOUTH("Zoraida", "Apolonia"),
     "offended, scornful"),
   talk("c21", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZL}, offended, she fans herself fast with her black fan", "RIGHT"), "offended, scornful"))),
 ("c22", 6, (talk("c22", "Apolonia", ots(f"Close-up of {APO} {YARD0}, {AR}, a dry half smile, leaning on her cane", ZOR_B, "LEFT") + " " + MOUTH("Apolonia", "Zoraida"),
     "dry, firm, a little ironic"),
   talk("c22", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, a dry half smile, leaning on her cane", "LEFT"), "dry, firm, a little ironic"))),
 ("c23", D8("c23"), (talk("c23", "Nicté", ots(f"Close-up of {NIC} {YARD0}, {NR}, calm, generous and firm, she glances at the ladder in the cave opening", ZOR_B, "LEFT") + " " + MOUTH("Nicté", "Zoraida"),
     "calm, dignified, generous"),
   talk("c23", "Nicté", one(f"Close-up of {NIC} {YARD}, {NR}, calm, generous and firm, she glances at the ladder in the cave opening", "LEFT"), "calm, dignified, generous"))),
 ("r4", 6, f"Medium shot of {ZOR} {YARD}, at the stone rim of the round cave opening on the LEFT, in silence, she climbs down {LADDER} into the cave opening step by step, holding her black fan, humiliated, "
           f"until only her burgundy hair is visible; {SOLO}; {ALONE}. No dialogue."),
 # 5. Reconciliación (cálida)
 ("c24", 6, (talk("c24", "Lisandro", two(f"{LIS} on the LEFT and {NIC} on the RIGHT under the arches, in profile facing each other very close {YARD0}, framed from the waist up; "
            f"Lisandro gently takes her bandaged hands in his, ashamed, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lisandro", "Nicté"),
     "ashamed, tender, low"),
   talk("c24", "Lisandro", one(f"Close-up of {LIS} {YARD}, {LM}, ashamed and tender", "RIGHT"), "ashamed, tender, low"))),
 ("c25", 6, (talk("c25", "Nicté", ots(f"Close-up of {NIC} {YARD0}, {NR}, a tired soft smile, her eyes shine", LIS_B, "LEFT") + " " + MOUTH("Nicté", "Lisandro"),
     "tender, soft, relieved"),
   talk("c25", "Nicté", one(f"Close-up of {NIC} {YARD}, {NR}, a tired soft smile, her eyes shine", "LEFT"), "tender, soft, relieved"))),
 # c26 grupo: Lisandro (LEFT) y Nicté (centro) de la mano, la abuela a la RIGHT habla
 ("c26", 6, (talk("c26", "Apolonia", f"Medium shot from the knees up {YARD0}: {LIS} on the LEFT and {NIC} in the middle holding hands, both looking at the old woman; {APO} on the RIGHT under the arches, "
            f"leaning on her cane, warm and wise, she speaks to them both; only these three people, no extras. " + SPK("Apolonia"),
     "warm, wise, slow"),
   talk("c26", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, warm and wise, leaning on her cane", "LEFT"), "warm, wise, slow"))),
 # 6. Gancho: Zoraida sola en la cueva (single)
 ("c27", 6, talk("c27", "Zoraida", one(f"Close-up of {ZOR} {CAVE}, {ZC}, alone in the dim cave, she pulls a palm fiber with clumsy fingers, then looks up at the bright round opening with a cold scheming smile", "LEFT"),
     "low, muttering, scheming")),
 # CTA con carisma (después del BLACK): Nicté sola bajo los arcos, a cámara
 ("c28", 10, talk("c28", "Nicté", f"Close-up from the chest up of {NIC} {YARD0}, alone under the arches of the corridor, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a small knowing smile, makes a short pause, raises one eyebrow, "
     f"tucks a loose strand of hair behind her ear with her bandaged fingers, tilts her head, glances toward the cave opening off to the side, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Vente hoy mismo y sácame de aquí.", "Vente hoy mismo, mijo."), ("Esa muchacha te tiene engañado.", "Esa muchacha no es lo que crees."),
        ("Que ya no te buscara, que eras feliz con otro.", "Que ya no te buscara."), ("¿Por mi bien me hiciste creer que me dejó?", "¿Por mi bien, amá?"),
        ("Tres semanas sin dormir, amá.", "Tres semanas, amá."), ("Para que nunca pudiera contestarle.", "Para que no hablaran."),
        ("Usted me quitó a mi esposo, doña Zoraida.", "Usted me alejó de mi esposo, doña Zoraida."), ("Porque a mí también me mentiste.", "Porque eres mi madre."),
        ("Eso es para las tejedoras.", "¿Yo, suegra?"), ("Ya van a ver quién teje a quién.", "Ya van a ver."),
        ("she taps her cane once on the ground", "she leans on her cane"), ("she waves her black fan dismissively toward the arches", "she holds her black fan"),
        ("whispering", "talking softly"), ("scheming", "quiet"), ("theatrical", "expressive"), ("whiny", "soft"), ("scornful", "surprised"), ("humiliated", "quiet"),
        ("self-righteous", "serious"), ("unashamed", "calm"), ("dismissive", "calm"), ("breaking", "low"), ("fake", "polite"), ("muttering", "talking softly"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("bitter", "quiet"), ("severe", "serious"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright late-morning light in a backyard with a palm-weaving cave in Bécal, Campeche, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, pink house and limestone backyard on the Yucatán peninsula of Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft daylight, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{APOLONIA_CHABLE}", "a small thin very old Maya Mexican woman with white hair in a low bun, a white embroidered huipil, a black rebozo and a dark wooden cane"),
         ("@{ZORAIDA_CANUL}", "a plump Mexican woman in her fifties with short teased burgundy-red hair, sunglasses on her head, a leopard-print blouse and many gold bangles"),
         ("@{NICTE_UCAN}", "a slim Maya Mexican woman in her late twenties with black hair in a low bun, a faded sky-blue dress, a beige apron and fingers wrapped in white cloth"),
         ("@{LISANDRO_PECH}", "a tall strong Maya Mexican man around thirty with short black hair, clean-shaven, a heather-grey t-shirt and dark jeans"),
         (" @{LOC_CUEVABECAL}", ""), (" @{LOC_PATIOBECAL}", "")]
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
