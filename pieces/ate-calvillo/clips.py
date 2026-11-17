"""Genera los clips de ate-calvillo PARTE 1 (El Ate de Calvillo, variante transformada del Final de la saga de don Evaristo de @atriumstories_,
"Su padre por fin tomó una decisión" (7706344565933985054, 210K; la saga suma 1.06M; padre-hijos-herencia): aquí, en el patio de la hija humilde en Calvillo, Aguascalientes,
la nuera rica llega a llevarse al suegro "antes de que cuaje el ate" porque ya supo que tiene huertas; el padre anuncia que las huertas son para la hija que lo recibió,
recuerda el boleto de camión que le compró su hijo, y el plazo se invierte: antes de que cuaje el ate le dejan las llaves de la camioneta, que está a su nombre; MEXI STORIES)
con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de hamaca-comalcalco (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS).
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Gancho 0-2 s (c01, la villana hablando, sin plano previo de objetos): Marcela en el portón le ordena a Gertrudis, que menea el cazo de ate:
# "Suelta ese cazo, cuñada. Antes de que cuaje el ate, mi suegro se va con nosotros." (injusticia + plazo).
# Plazo: antes de que cuaje el ate; vuelve invertido en c25: "Antes de que cuaje el ate, Marcela, me dejas las llaves. Esa camioneta está a mi nombre."
# Capas: la nuera viene por el suegro -> las huertas del cañón son para Gertrudis (c06) -> el boleto de camión (c08-c10) -> la cochera para dos camionetas (c12)
# -> Gertrudis le abrió sin saber (c14-c18) -> el hijo culpa a su esposa y ella a él (c19-c21) -> el hijo se quiebra (c22) -> plazo invertido: las llaves (c25)
# -> la camioneta era prestada (c27) -> el lunes, en la empacadora, conocerá a su patrón (c28).
# Geografía fija (patio de la casita de adobe de Gertrudis): fogón con el cazo a la IZQUIERDA (Gertrudis meneando, Cleofas junto al fogón, a la derecha de su hija);
# portón verde a la DERECHA (Marcela con su bolsa blanca, Eleazar con la llave de la camioneta, a la derecha de su esposa).
# Plano de presentación: Marcela c01, Gertrudis r1, Cleofas r2, Eleazar r3. CTA (c29): Cleofas solo a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
PAT0 = ("in the small backyard of a humble ochre adobe house in Calvillo, Aguascalientes @{LOC_ATECALVILLO} in the late afternoon: a wood-fired adobe stove with a big copper cauldron, "
        "woven baskets full of yellow guavas, a green iron gate open to a dirt street, guava trees behind, warm golden light; no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
CAULDRON = "a big copper cauldron of thick bubbling pink guava paste on a wood-fired adobe stove"
PADDLE = "a long wooden paddle"
HAT = "a light straw palm hat"
KEY = "a black pickup truck key"
BAG = "a small white handbag"
TRUCK = "a dark grey double-cab pickup truck"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Cleofas sombrero de palma, bigote blanco y paliacate rojo (figura de autoridad);
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
# Bordes: Marcela/Eleazar le hablan a Cleofas -> espalda de Cleofas en el borde LEFT; Cleofas les habla -> espalda de Marcela o de Eleazar en el borde RIGHT;
# Marcela le habla a Gertrudis -> espalda de Gertrudis LEFT; Gertrudis le habla a Marcela -> espalda de Marcela RIGHT;
# dentro del par Gertrudis-Cleofas, Gertrudis siempre a la izquierda (solo two-shots).
CLE_B = "@{CLEOFAS_ELIZALDE} seen from behind (light straw palm hat, brown-and-cream plaid shirt, the knot of a red bandana at the back of his neck, lean)"
GER_B = "@{GERTRUDIS_ELIZALDE} seen from behind (a long black braid down her back, light-blue blouse, the ties of a pink apron at her back)"
MAR_B = "@{MARCELA_COLLADO} seen from behind (long straight auburn-red hair, dark sunglasses on top of her head, emerald-green satin blouse)"
ELE_B = "@{ELEAZAR_ELIZALDE} seen from behind (shaved head, wine-red polo shirt, stocky)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
GMOUTH = lambda spk: f"Only {spk} speaks: {spk}'s lips move clearly with every word; the other people stay silent the whole shot, mouths closed, only listening."
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

CL = f"standing on the LEFT beside the wood-fired adobe stove, wearing {HAT}"                       # Cleofas
GL = f"standing on the LEFT at the wood-fired adobe stove, stirring {CAULDRON} with {PADDLE}"        # Gertrudis
MR = f"standing on the RIGHT by the open green iron gate, {BAG} on her arm"                         # Marcela
ER = f"standing on the RIGHT by the open green iron gate, holding {KEY}"                            # Eleazar

CLIPS = [
 # 1. Gancho (0-2 s): Marcela YA hablando en el portón, Gertrudis meneando el cazo; plazo: antes de que cuaje el ate.  OTS (Gertrudis de espaldas, LEFT)
 ("c01", 6, (talk("c01", "Marcela", ots(f"Medium shot of {MAR} {PAT0}, {MR}, talking from the very first frame, she pushes her sunglasses up and nods toward the cauldron, "
     f"cold and bossy", GER_B, "LEFT") + " " + MOUTH("Marcela", "Gertrudis"), "cold, bossy, mocking"),
   talk("c01", "Marcela", f"Medium shot of {MAR} {PAT}, {MR}, talking from the very first frame, she pushes her sunglasses up, cold and bossy; "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in an emerald-green blouse')}.", "cold, bossy, mocking"))),
 # r1: presentación de Gertrudis como two-shot mudo (cuerpo entero visible)
 ("r1", 6, (two(f"{GER} on the LEFT {GL}, in profile facing right, and {MAR} on the RIGHT {MR}, in profile facing left, {PAT0}, framed from the knees up so both outfits show clearly; "
            f"Gertrudis keeps stirring the guava paste and lifts her eyes slowly, calm and dignified, slightly closer to the camera and in sharper focus") + " Slow push-in. " + MUTE,
   f"Medium shot of {GER} {PAT}, {GL}, she keeps stirring and lifts her eyes slowly, calm and dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a long black braid')}. Slow push-in. No dialogue.")),
 ("c02", 6, (talk("c02", "Gertrudis", ots(f"Close-up of {GER} {PAT0}, {GL}, calm and firm, she stops stirring", MAR_B, "RIGHT") + " " + MOUTH("Gertrudis", "Marcela"),
     "calm, firm, a little hurt"),
   talk("c02", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL}, calm and firm", "RIGHT"), "calm, firm, a little hurt"))),
 # c03 (la burla clave): single
 ("c03", 6, talk("c03", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, she laughs once and looks the guava baskets up and down with contempt", "LEFT"),
     "mocking, arrogant")),
 # r2: presentación de Cleofas (single PRES)
 ("r2", 6, f"Medium shot of {CLE} {PAT}, {CL}, already standing in place, he settles his straw hat on his head and straightens up, calm and dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a straw hat')}. Slow push-in. No dialogue."),
 ("c04", 6, (talk("c04", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, calm and firm, he looks at his daughter-in-law", MAR_B, "RIGHT") + " " + MOUTH("Cleofas", "Marcela"),
     "calm, firm, slow"),
   talk("c04", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, calm and firm", "RIGHT"), "calm, firm, slow"))),
 # r3: presentación de Eleazar (single PRES)
 ("r3", 6, f"Medium shot of {ELE} {PAT}, {ER}, already standing in place, he spins the truck key on his finger and checks his gold watch, impatient, "
           f"{TRUCK} parked in the street behind him, {gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a wine-red polo shirt')}. Slow push-in. No dialogue."),
 ("c05", 6, (talk("c05", "Eleazar", ots(f"Close-up of {ELE} {PAT0}, {ER}, forcing a friendly smile, he shows the key", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "falsely friendly, hurried"),
   talk("c05", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, forcing a friendly smile", "LEFT"), "falsely friendly, hurried"))),
 ("c06", 6, (talk("c06", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, serene and firm, he looks his son in the eye", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "serene, firm"),
   talk("c06", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, serene and firm", "RIGHT"), "serene, firm"))),
 # r4 grupo mudo: la noticia cae (geografía completa)
 ("r4", 6, (f"Medium wide shot from the knees up {PAT0}: on the LEFT {GER} {GL}, she freezes with the paddle in her hand; beside her {CLE} {CL}, calm; "
            f"on the RIGHT by the gate {MAR} {MR}, she slowly lowers her sunglasses, and {ELE} {ER}, the key stops spinning; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ELE} {PAT}, {ER}, in silence, the key stops spinning in his hand, his smile drops", "LEFT") + " Slow push-in. No dialogue.")),
 ("c07", 6, (talk("c07", "Eleazar", ots(f"Close-up of {ELE} {PAT0}, {ER}, offended, he points at himself", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "offended, loud, entitled"),
   talk("c07", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, offended, he points at himself", "LEFT"), "offended, loud, entitled"))),
 ("c08", 6, (talk("c08", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, quiet, his eyes shine", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "quiet, hurt, slow"),
   talk("c08", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, quiet, his eyes shine", "RIGHT"), "quiet, hurt, slow"))),
 ("c09", 6, (talk("c09", "Eleazar", two(f"{CLE} on the LEFT {CL}, in profile facing right, and {ELE} on the RIGHT {ER}, in profile facing left, {PAT0}, framed from the knees up; "
            f"Eleazar spreads his hands, defensive, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eleazar", "Cleofas"),
     "defensive, pleading"),
   talk("c09", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, he spreads his hands, defensive", "LEFT"), "defensive, pleading"))),
 ("c10", 6, (talk("c10", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, he touches the brim of his straw hat, hurt but dignified", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "hurt, dignified"),
   talk("c10", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, he touches the brim of his straw hat, hurt but dignified", "RIGHT"), "hurt, dignified"))),
 ("c11", 6, (talk("c11", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, she crosses her arms, cool and dismissive", CLE_B, "LEFT") + " " + MOUTH("Marcela", "Cleofas"),
     "cool, dismissive"),
   talk("c11", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, she crosses her arms, cool and dismissive", "LEFT"), "cool, dismissive"))),
 ("c12", 6, (talk("c12", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, a dry half smile", MAR_B, "RIGHT") + " " + MOUTH("Cleofas", "Marcela"),
     "dry, ironic, calm"),
   talk("c12", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, a dry half smile", "RIGHT"), "dry, ironic, calm"))),
 # c13 two-shot de la pareja: los dos en el portón, mirando hacia la izquierda
 ("c13", 6, (talk("c13", "Marcela", two(f"{MAR} {MR} and {ELE} standing beside her by the gate holding the key, both {PAT0}, framed from the waist up, both facing the camera three-quarters toward someone at the LEFT; "
            f"Marcela tilts her head, greedy and annoyed, slightly closer to the camera and in sharper focus; Eleazar nods along") + " " + MOUTH("Marcela", "Eleazar"),
     "greedy, annoyed"),
   talk("c13", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, she tilts her head, greedy and annoyed", "LEFT"), "greedy, annoyed"))),
 # c14 (la verdad que duele): single de Cleofas
 ("c14", 6, talk("c14", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, calm, he glances toward his daughter with tenderness, then back", "RIGHT"),
     "calm, sincere, slow")),
 # i01: el cazo de ate espesándose (el plazo; inserto en medio)
 ("i01", 6, f"Close-up insert {PAT0}: {CAULDRON}, the pink guava paste thickening and bubbling slowly, {PADDLE} resting on the rim, wisps of steam, golden light. "
            f"Only the cauldron, the paddle and the fire, no people, no hands, no letters. No dialogue."),
 ("c15", 6, (talk("c15", "Gertrudis", two(f"{GER} on the LEFT {GL} and {CLE} beside her on the RIGHT {CL}, in profile facing each other at the wood-fired adobe stove {PAT0}, "
            f"framed from the waist up; Gertrudis, moved and humble, slightly closer to the camera and in sharper focus") + " " + MOUTH("Gertrudis", "Cleofas"),
     "humble, tender"),
   talk("c15", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL}, moved and humble", "RIGHT"), "humble, tender"))),
 ("c16", 6, (talk("c16", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, she smiles quickly, seizing the chance", GER_B, "LEFT") + " " + MOUTH("Marcela", "Gertrudis"),
     "quick, opportunistic"),
   talk("c16", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, she smiles quickly, seizing the chance", "LEFT"), "quick, opportunistic"))),
 ("c17", 6, (talk("c17", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, firm, he raises one hand slowly", MAR_B, "RIGHT") + " " + MOUTH("Cleofas", "Marcela"),
     "firm, protective"),
   talk("c17", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, firm, he raises one hand slowly", "RIGHT"), "firm, protective"))),
 # c18 (el sacrificio, casi llanto): single
 ("c18", 6, talk("c18", "Gertrudis", one(f"Close-up of {GER} {PAT}, {GL}, her eyes shine, she wipes her hands on the pink apron", "RIGHT"),
     "emotional, sad")),
 ("c19", 6, (talk("c19", "Eleazar", ots(f"Close-up of {ELE} {PAT0}, {ER}, cornered, he points sideways at his wife without looking at her", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "cornered, cowardly"),
   talk("c19", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, cornered, he looks away", "LEFT"), "cornered, cowardly"))),
 # c20 two-shot de la pareja: Marcela le reclama a Eleazar
 ("c20", 6, (talk("c20", "Marcela", two(f"{MAR} on the LEFT and {ELE} on the RIGHT, in profile facing each other by the open green iron gate {PAT0}, framed from the waist up, he holds the key; "
            f"Marcela turns to her husband, offended, slightly closer to the camera and in sharper focus") + " " + MOUTH("Marcela", "Eleazar"),
     "offended, firm"),
   talk("c20", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, offended and firm, looking sideways", "RIGHT"), "offended, firm"))),
 ("c21", 6, (talk("c21", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, sad and firm, looking straight at his son", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "sad, firm"),
   talk("c21", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, sad and firm", "RIGHT"), "sad, firm"))),
 # r5 grupo mudo: silencio; Eleazar baja la cabeza
 ("r5", 6, (f"Medium wide shot from the knees up {PAT0}: on the LEFT {GER} {GL} and {CLE} {CL}, both silent; on the RIGHT by the gate {ELE} {ER}, he lowers his head, "
            f"and {MAR} {MR}, she looks away; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ELE} {PAT}, {ER}, in silence, he lowers his head slowly", "LEFT") + " Slow push-in. No dialogue.")),
 # c22 (el hijo se quiebra): single
 ("c22", 6, talk("c22", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, his eyes shine, his voice breaks, ashamed", "LEFT"),
     "ashamed, breaking, low")),
 ("c23", 6, (talk("c23", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, his eyes shine, very quiet", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "very quiet, hurt, slow"),
   talk("c23", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, his eyes shine, very quiet", "RIGHT"), "very quiet, hurt, slow"))),
 ("c24", 6, (talk("c24", "Marcela", ots(f"Close-up of {MAR} {PAT0}, {MR}, she grabs her handbag and lowers her sunglasses, venomous", CLE_B, "LEFT") + " " + MOUTH("Marcela", "Cleofas"),
     "venomous, mocking"),
   talk("c24", "Marcela", one(f"Close-up of {MAR} {PAT}, {MR}, she grabs her handbag, venomous", "LEFT"), "venomous, mocking"))),
 # c25 grupo: el plazo invertido (Cleofas en primer término a la izquierda; la pareja en el portón a la derecha)
 ("c25", 6, (talk("c25", "Cleofas", f"Medium wide shot from the knees up {PAT0}: on the LEFT, closest to the camera and in sharp focus, {CLE} {CL}, firm and slow, he holds out his open hand toward the gate; "
            f"on the RIGHT by the gate {MAR} {MR} and {ELE} {ER}, both silent and stiff; only these three people, no extras. " + GMOUTH("Cleofas"), "firm, slow, final"),
   talk("c25", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, firm, slow and final, he holds out his open hand", "RIGHT"), "firm, slow, final"))),
 # r6 grupo mudo: Marcela se congela; Eleazar mira la llave en su mano
 ("r6", 6, (f"Medium wide shot from the knees up {PAT0}: on the RIGHT by the gate {MAR} {MR}, frozen, clutching her handbag, and {ELE} {ER}, staring at the key in his hand; "
            f"on the LEFT {CLE} {CL}, waiting calmly with his hand out; only these three people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {MAR} {PAT}, {MR}, in silence, frozen, she clutches her handbag", "LEFT") + " Slow push-in. No dialogue.")),
 ("c26", 6, (talk("c26", "Eleazar", ots(f"Close-up of {ELE} {PAT0}, {ER}, stunned, he looks at the key and then at his father", CLE_B, "LEFT") + " " + MOUTH("Eleazar", "Cleofas"),
     "stunned, disbelieving"),
   talk("c26", "Eleazar", one(f"Close-up of {ELE} {PAT}, {ER}, stunned, he looks at the key", "LEFT"), "stunned, disbelieving"))),
 ("c27", 6, (talk("c27", "Cleofas", ots(f"Close-up of {CLE} {PAT0}, {CL}, sad, a small bitter smile", ELE_B, "RIGHT") + " " + MOUTH("Cleofas", "Eleazar"),
     "sad, calm"),
   talk("c27", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, sad, a small bitter smile", "RIGHT"), "sad, calm"))),
 # i02: la llave de la camioneta en la mesita, junto al sombrero
 ("i02", 6, f"Close-up insert {PAT0}: {KEY} lies on a small wooden table next to {HAT} and a basket of yellow guavas, golden light. "
            f"Only the objects, no people, no hands, no letters. No dialogue."),
 # c28 (el gancho de la Parte 2): single de Cleofas
 ("c28", 6, talk("c28", "Cleofas", one(f"Close-up of {CLE} {PAT}, {CL}, he puts his straw hat back on, serious, almost a smile", "RIGHT"),
     "serious, quiet, powerful")),
 ("r7", 6, one(f"Close-up of {ELE} {PAT}, {ER}, in silence, he goes pale and swallows, his empty hand trembling slightly", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Cleofas solo junto al fogón, a cámara
 ("c29", 10, talk("c29", "Cleofas", f"Close-up from the chest up of {CLE} {PAT0}, alone, holding {KEY}, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a calm knowing smile, makes a short pause, raises one eyebrow, "
     f"tips his straw hat, spins the key once on his finger, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("points", "gestures"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("with contempt", "coolly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Antes de que cuaje el ate, mi suegro se va con nosotros.", "Mi suegro se va con nosotros."), ("Nadie me va a cargar como costal, Marcela.", "Nadie me lleva, Marcela."),
        ("Y no te bajaste ni del carro.", "Y te fuiste."), ("Y tú, cuñada, que te aproveche el ate.", "Y tú, cuñada, buen provecho."),
        ("Lo vi llorar en la ventanilla, apá.", "Lo vi en la ventanilla, apá."), ("Antes de que cuaje el ate, Marcela, me dejas las llaves.", "Marcela, me dejas las llaves."),
        ("his empty hand trembling slightly", "quiet"), ("his voice breaks, ashamed", "quiet"), ("seizing the chance", "smiling"), ("venomous", "calm"), ("cowardly", "quiet"),
        ("greedy", "surprised"), ("falsely friendly", "friendly"), ("opportunistic", "calm"), ("entitled", "serious"), ("bossy", "firm"), ("cornered", "serious"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("stunned", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("breaking", "quiet"),
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
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()
