"""Genera los clips de garrafon-bernal-p2 PARTE 2 (Los Garrafones de Bernal, continuación de pieces/garrafon-bernal; ritmo de la P2 de @atriumstories_ "La siguió hasta una bodega abandonada", viñedo de Bernal, Querétaro, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de la Parte 1 (todas sus defensas: gatito en imagen, reload_flow, new_project, control de descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS en gen()).
Mismas hojas que la Parte 1 (copiadas a chars/, se resuben con make_sheets.py --reupload) + LORENA_ALDACO, RUPERTO_MENDIOLA, LOC_PORTONBERNAL y LOC_BODEGABERNAL. Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4)."""
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
# Gancho 0-2 s (recordatorio de la P1): la camioneta blanca con el motor encendido en el portón de atrás (i01, <=0.9 s) y Leoncio en la cocina: "Ahí está la camioneta, doña Petronila. Antes de que se meta el sol, la sigo."
# Ritmo de la P2 de Atrium (consuelo + promesa -> complot de la esposa con el cargador -> el cargador con miedo -> la sigue -> careo frente a la bodega -> "no es lo que piensas" -> abre la puerta),
# pero aquí SÍ se abre: la bodega está llena del mandado y de garrafones llenos que Lorena vende los domingos en el tianguis. Castigo: las llaves de la camioneta y del candado, "antes de que se meta el sol, te vas".
# Desenlace: el candado se abre, Jovita toma agua limpia, Petronila manda en la cocina, cena de todos bajo las viñas. CTA de Leoncio en el patio.
# Misma ropa que la P1 (anclas LEO, JOV, PET idénticas). Personajes nuevos con plano de presentación MUDO antes de hablar o ser nombrados: Lorena r1, Ruperto r2.
# Geografía fija. Cocina (c01-c03): Petronila a la IZQUIERDA junto a la estufa, Leoncio a la DERECHA junto a la puerta (como en la P1).
# Portón de atrás (r1-c12): Ruperto a la IZQUIERDA junto a las cajas apiladas; Lorena (r1-c07) y luego Leoncio (c09-c12) a la DERECHA junto a la redila de la camioneta.
# Bodega (c13-r4): Lorena a la IZQUIERDA delante de la puerta azul; Leoncio a la DERECHA. Patio al ponerse el sol (i08-c32): Jovita y Petronila a la IZQUIERDA, Leoncio a la DERECHA. Sin Navidad.
KIT0 = ("in the big rustic kitchen of the vineyard house near Bernal, Querétaro @{LOC_COCINABERNAL} in warm afternoon light from a window: walls with blue-and-white tiles, a gas stove with clay pots on the LEFT, "
        "tall wooden pantry shelves that are half empty, a wooden table in the middle, the kitchen door on the RIGHT; no readable text, no signs, no logos")
KIT = KIT0 + "; nobody else in the background, no extras, nobody besides the person described"
GATE0 = ("at the back gate of the vineyard farmhouse near Bernal, Querétaro @{LOC_PORTONBERNAL} in warm late-afternoon golden light: an old open wooden double gate in a white stone wall, "
         "packed earth ground, stacked cardboard grocery boxes on the LEFT, the tailgate of a plain white pickup truck on the RIGHT, grapevines beyond the gate, the Peña de Bernal far away; no readable text, no signs, no logos")
GATE = GATE0 + "; nobody else in the background, no extras, nobody besides the person described"
BOD0 = ("in front of an old abandoned adobe warehouse at the dusty edge of Bernal, Querétaro @{LOC_BODEGABERNAL} at sunset: cracked ochre adobe walls, a weathered blue wooden double door with an iron latch on the LEFT, "
        "a dirt lot with dry grass, the huge rock of the Peña de Bernal behind in orange light; no readable text, no signs, no logos")
BOD = BOD0 + "; nobody else in the background, no extras, nobody besides the person described"
PAT0 = ("in the dusty work yard of a small family vineyard near Bernal, Querétaro @{LOC_PATIOBERNAL} at sunset, the sun touching the horizon: packed earth ground, stacks of wooden grape crates, "
        "a big round galvanized tub of grey rinse water on the LEFT, a low stone bench on the RIGHT with four blue plastic water jugs, "
        "green rows of grapevines behind, the huge rock monolith of the Peña de Bernal on the horizon; no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Las de la P1 sin cambios. Solo Lorena moño bajo negro, labios rojos y blusa de seda turquesa; solo Ruperto pelo rizado, barba negra y camisa de mezclilla abierta.
LEO = ("@{LEONCIO_AVALOS} (57-year-old Mexican man, light-brown skin, tall and slim, silver hair combed back, a short neatly trimmed white beard, no hat, no glasses, "
       "a beige linen long-sleeve shirt under a dark brown suede vest, dark jeans, a silver wristwatch on his left wrist, his hands kept low)")
JOV = ("@{JOVITA_RESENDIZ} (26-year-old adult Mexican woman, brown skin, slim, black hair in a low ponytail under a red bandana tied on her head, no makeup, "
       "an olive-green long-sleeve cotton work shirt, faded jeans, a wide straw hat hanging on her back by its cord)")
PET = ("@{PETRONILA_OCADIZ} (64-year-old Mexican woman, brown skin, short and sturdy, grey hair in a tight bun, thin gold reading glasses hanging on a beaded cord around her neck, "
       "a navy-blue cardigan over a white blouse, a red-and-white checkered apron)")
LOR = ("@{LORENA_ALDACO} (49-year-old Mexican woman, light skin, slim, sleek black hair pulled back in a low bun, red lipstick, small gold stud earrings, "
       "a turquoise silk long-sleeve blouse, white wide-leg trousers, thin gold bangles on her right wrist)")
RUP = ("@{RUPERTO_MENDIOLA} (34-year-old Mexican man, brown skin, stocky, short curly black hair, a short black beard, no hat, no glasses, "
       "a plain mustard-yellow t-shirt under an open faded denim shirt with rolled sleeves, dark work trousers)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
JUGS = "four blue plastic water jugs tied together with a heavy steel chain and a closed padlock on a low stone bench"
TRUCK = "a plain white pickup truck with cardboard grocery boxes and full blue water jugs in the open back, no letters, no logos"
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

PL = "standing on the LEFT beside the gas stove with the clay pots"                                        # Petronila (cocina)
LK = "standing on the RIGHT just inside the kitchen door"                                                   # Leoncio (cocina)
RG = "standing on the LEFT beside the stacked cardboard grocery boxes"                                      # Ruperto (portón)
WG = "standing on the RIGHT beside the open tailgate of the white pickup truck"                             # Lorena (portón)
LG = "standing on the RIGHT beside the open wooden gate"                                                    # Leoncio (portón)
WB = "standing on the LEFT in front of the weathered blue wooden double door"                               # Lorena (bodega)
LB = "standing on the RIGHT in the dirt lot facing the blue door"                                           # Leoncio (bodega)
LR = "standing on the RIGHT of the yard beside the low stone bench with the blue water jugs"                # Leoncio (patio)
JLS = "standing on the LEFT beside the galvanized tub and the stacked wooden grape crates"                 # Jovita (patio)
PY = "standing on the LEFT of the yard beside the stacked wooden grape crates"                              # Petronila (patio)

CLIPS = [
 # 1. Gancho (0-2 s, recordatorio): la camioneta blanca en el portón de atrás; Leoncio en la cocina con el plazo de la puesta de sol
 ("i01", 6, f"Wide shot {GATE0}: {TRUCK} parked by the open wooden gate, the engine running with a little exhaust. No people visible, no letters, no license plate. No dialogue."),
 ("c01", 6, talk("c01", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, determined, he glances toward the window and back", "LEFT"),
     "determined, firm, low")),
 ("c02", 6, talk("c02", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she wrings her apron with both hands, her eyes shine, worried", "RIGHT"),
     "worried, quiet, pleading")),
 ("c03", 6, talk("c03", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, warm and protective, he nods once", "LEFT"),
     "warm, protective, firm")),
 # 2. El complot en el portón de atrás: presentación muda de Lorena (r1) y Ruperto (r2) antes de que hablen o los nombren
 ("r1", 6, f"Medium shot of {LOR} {GATE}, {WG}, in silence, she adjusts the gold bangles on her wrist and looks over the boxes in the truck with a cold satisfied little smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a turquoise blouse')}. Slow push-in. No dialogue."),
 ("r2", 6, f"Medium shot of {RUP} {GATE}, {RG}, in silence, he lifts a heavy cardboard grocery box from the stack, tired, he glances over his shoulder, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a denim shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Lorena", one(f"Close-up of {LOR} {GATE}, {WG}, impatient, she points with her chin toward the truck", "LEFT"),
     "cold, bossy, quick")),
 ("c05", 6, talk("c05", "Ruperto", one(f"Close-up of {RUP} {GATE}, {RG}, he wipes his forehead with his sleeve, uneasy", "RIGHT"),
     "uneasy, humble, quiet")),
 ("c06", 6, talk("c06", "Lorena", one(f"Close-up of {LOR} {GATE}, {WG}, she smiles coldly, unbothered", "LEFT"),
     "cold, dismissive, calm")),
 ("c07", 6, talk("c07", "Lorena", one(f"Close-up of {LOR} {GATE}, {WG}, she leans in a little, her smile disappears, threatening", "LEFT"),
     "low, threatening, cold")),
 ("c08", 6, talk("c08", "Ruperto", one(f"Close-up of {RUP} {GATE}, {RG}, he lowers his eyes, frightened", "RIGHT"),
     "frightened, quiet")),
 ("i02", 6, f"Wide shot {GATE0}: {TRUCK} drives out through the open wooden gate onto a dirt road, a cloud of dust in the golden light, the sun low over the Peña de Bernal. "
            f"No faces visible, no letters, no license plate. No dialogue."),
 # 3. El cargador con miedo
 ("c09", 6, talk("c09", "Leoncio", one(f"Close-up of {LEO} {GATE}, {LG}, urgent, he looks toward the road and then at the young man", "LEFT"),
     "urgent, firm")),
 ("c10", 6, talk("c10", "Ruperto", one(f"Close-up of {RUP} {GATE}, {RG}, he holds a cardboard box against his chest, afraid", "RIGHT"),
     "afraid, honest, quiet")),
 ("c11", 6, talk("c11", "Ruperto", one(f"Close-up of {RUP} {GATE}, {RG}, his eyes shine, pleading", "RIGHT"),
     "pleading, very quiet")),
 ("c12", 6, talk("c12", "Leoncio", one(f"Close-up of {LEO} {GATE}, {LG}, he puts one hand on his heart for a second, then looks at the road, determined", "LEFT"),
     "reassuring, then determined")),
 # 4. La bodega abandonada
 ("i03", 6, f"Wide shot of a dusty dirt road near Bernal, Querétaro, at sunset, {TRUCK} far ahead raising dust, the huge rock of the Peña de Bernal in orange light. No people visible, no letters, no signs. No dialogue."),
 ("i04", 6, f"Wide shot {BOD0}: {TRUCK} parked in front of the blue double door, the door slightly open. No people visible, no letters, no license plate. No dialogue."),
 ("c13", 6, talk("c13", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, out of breath, serious, his jaw tight", "LEFT"),
     "firm, serious, controlled")),
 ("c14", 6, talk("c14", "Lorena", one(f"Close-up of {LOR} {BOD}, {WB}, she freezes, caught, her eyes wide", "RIGHT"),
     "surprised, nervous")),
 ("c15", 6, talk("c15", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, he takes one step forward, cold", "LEFT"),
     "cold, firm")),
 ("c16", 6, talk("c16", "Lorena", one(f"Close-up of {LOR} {BOD}, {WB}, she forces a sweet smile and raises both open hands", "RIGHT"),
     "sweet, nervous, quick")),
 ("c17", 6, talk("c17", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, hurt and angry, his eyes shine", "LEFT"),
     "hurt, angry, low")),
 ("c18", 6, talk("c18", "Lorena", one(f"Close-up of {LOR} {BOD}, {WB}, she stands in front of the door, her sweet smile gone, defensive", "RIGHT"),
     "defensive, cold")),
 ("c19", 6, talk("c19", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, calm and final, he holds her gaze", "LEFT"),
     "calm, final, firm")),
 ("i05", 6, f"Close-up insert {BOD0}: a man's hand with a silver wristwatch on the wrist and a beige linen sleeve lifts the iron latch and pushes the blue wooden door open, golden light enters the dark inside. "
            f"Only the hand and the door, no faces. No dialogue."),
 ("i06", 6, f"Inside the old adobe warehouse at sunset, light beams through the open door: tall wooden shelves packed to the ceiling with sacks of beans and rice, cans, cardboard grocery boxes "
            f"and rows of full blue plastic water jugs, a metal hand cart, dust in the light. No people, no letters, no labels, no readable text. No dialogue."),
 ("r3", 6, one(f"Close-up of {LEO} {BOD}, {LB}, in silence, he looks into the open warehouse, shocked, his face goes pale, he slowly breathes in", "LEFT") + " Slow push-in. No dialogue."),
 # 5. Desenlace del giro y castigo
 ("c20", 6, talk("c20", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, he turns back from the warehouse, shocked and hurt", "LEFT"),
     "shocked, hurt, low")),
 ("c21", 6, talk("c21", "Lorena", one(f"Close-up of {LOR} {BOD}, {WB}, she lifts her chin, cold and proud", "RIGHT"),
     "cold, proud")),
 ("c22", 6, talk("c22", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, indignant, he gestures toward the shelves", "LEFT"),
     "indignant, angry, firm")),
 ("c23", 6, talk("c23", "Lorena", one(f"Close-up of {LOR} {BOD}, {WB}, she shrugs with contempt and looks away", "RIGHT"),
     "cold, disdainful")),
 ("c24", 6, talk("c24", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, very calm and cold, he holds out one open hand, palm up", "LEFT"),
     "very calm, cold, final")),
 ("i07", 6, f"Close-up insert {BOD0}: a woman's hand with thin gold bangles drops a car key and a small padlock key into a man's open palm, a silver wristwatch on his wrist. "
            f"Only the two hands and the keys, no faces. No dialogue."),
 ("c25", 6, talk("c25", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, he closes his hand around the keys, firm", "LEFT"),
     "firm, slow, final")),
 ("c26", 6, talk("c26", "Lorena", one(f"Close-up of {LOR} {BOD}, {WB}, her mouth opens, she can not believe it, offended", "RIGHT"),
     "offended, disbelieving")),
 ("c27", 6, talk("c27", "Leoncio", one(f"Close-up of {LEO} {BOD}, {LB}, proud and serene, he turns toward the truck", "LEFT"),
     "serene, firm")),
 ("r4", 6, one(f"Close-up of {LOR} {BOD}, {WB}, in silence, she stands alone by the open door, stunned, her eyes shine with rage, her lips tight", "RIGHT") + " Slow push-in. No dialogue."),
 # 6. El candado se abre: agua, comida y cocina para todos
 ("i08", 6, f"Close-up insert {PAT0}: a man's hand with a silver wristwatch turns a small key in the closed padlock, the padlock opens and the heavy steel chain slides off the four blue water jugs on the stone bench. "
            f"Only the hand, the padlock, the chain and the jugs, no faces, no letters. No dialogue."),
 ("c28", 6, talk("c28", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, warm, he lifts the loose chain in one hand", "LEFT"),
     "warm, firm, kind")),
 ("c29", 6, talk("c29", "Jovita", one(f"Close-up of {JOV} {PAT}, {JLS}, moved, her eyes shine, a small grateful smile", "RIGHT"),
     "moved, sincere, quiet")),
 ("c30", 6, talk("c30", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, smiling, he turns his head toward the older woman", "LEFT"),
     "warm, proud")),
 ("c31", 6, talk("c31", "Petronila", one(f"Close-up of {PET} {PAT}, {PY}, she laughs softly and wipes one eye with the corner of her apron", "RIGHT"),
     "happy, moved")),
 ("i09", 6, f"Wide shot of a long wooden table under the grapevines of a vineyard near Bernal, Querétaro, at dusk with string lights: clay pots of beans and stew, stacks of tortillas, "
            f"blue water jugs and glasses of water; only hands passing plates and filling glasses at the edges, no faces visible. No letters, no signs. No dialogue."),
 ("r5", 6, one(f"Close-up of {JOV} {PAT}, {JLS}, in silence, she drinks clean water from a clear glass, then lowers it and smiles with shining eyes", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Leoncio solo en el patio al ponerse el sol, a cámara
 ("c32", 10, talk("c32", "Leoncio", f"Close-up from the chest up of {LEO} {PAT}, alone, standing in the yard, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a knowing little smile, raises one eyebrow, makes a short pause, "
     f"strokes his white beard with one hand, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "hurt"/"angry" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Si hablas, no vuelves a cargar aquí.", "Y de esto, ni una palabra."), ("Los del patio, que aguanten.", "Los del patio se quedan."),
        ("Se lo juro por mi madre.", "Se lo prometo."), ("Si sabe que hablé, me echa.", "Si sabe que hablé, se enoja."),
        ("Mi gente tomaba agua sucia por ti.", "Mi gente pasaba sed por ti."), ("Son peones, Leoncio, aguantan.", "Ellos aguantan, Leoncio."),
        ("¿Me corres de mi propia casa?", "¿Me sacas de mi propia casa?"), ("¿Por unos peones?", "¿Por ellos?"),
        ("Y tú, antes de que se meta el sol, te vas.", "Y tú, antes de que se meta el sol, te vas de la casa."),
        ("her eyes shine with rage, her lips tight", "her lips tight"), ("she shrugs with contempt and looks away", "she looks away"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("contempt", "coolness"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm sunset light at a small family vineyard near Bernal, Querétaro, grapevines, adobe and stone walls, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a vineyard farm in Querétaro at sunset, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft sunset light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LEONCIO_AVALOS}", "a tall Mexican man in his late fifties with a short white beard in a beige linen shirt and a brown suede vest"),
         ("@{JOVITA_RESENDIZ}", "a slim adult Mexican woman with a red bandana on her head in an olive-green work shirt"),
         ("@{PETRONILA_OCADIZ}", "an older Mexican woman with a grey bun in a navy cardigan and a red-and-white checkered apron"),
         ("@{LORENA_ALDACO}", "a slim Mexican woman in her late forties with sleek black hair in a low bun and red lipstick in a turquoise silk blouse"),
         ("@{RUPERTO_MENDIOLA}", "a stocky Mexican man in his thirties with curly black hair and a short beard in an open denim shirt over a mustard t-shirt"),
         (" @{LOC_COCINABERNAL}", ""), (" @{LOC_PORTONBERNAL}", ""), (" @{LOC_BODEGABERNAL}", ""), (" @{LOC_PATIOBERNAL}", "")]
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
    want = set(sys.argv[1:])
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
            files, log = gen(variant(body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()  # solo contra los clips ya guardados (c*/i*/r*.mp4), nunca contra la descarga misma
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"  # Flow devolvió un clip ya bajado
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
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
