"""Genera los clips de invernadero-atlixco PARTE 1 (Las Nochebuenas de Atlixco, remake transformado de "Veinte años a su lado… y lo vendieron" de @atriumstories_, valle de Atlixco, Puebla, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de piloncillo-rio (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (una maceta de nochebuena se rompe en la tierra) con la figura y el plazo ("Hasta que den las seis, Efrén. O tu patrona se queda sin cosecha");
# poder SIN armas: una fila de camiones de redilas cargados de nochebuenas, los productores del valle en fila con los brazos cruzados, la patrona que recoge su nochebuena.
# El que humilla: Nazario, acaparador de flores, se mete al invernadero de doña Hermelinda con unas llaves y le exige a Efrén, el encargado, que le firme la cosecha. Plazo: las campanas de las seis (i03).
# Indicios del giro ANTES de revelarlo: "alguien de la casa me abrió" (c07), las llaves con el llavero de nochebuena tallado (i02), "me dijeron que andaba en Puebla" (c23),
#   "traigo un trato firmado" (c29), "viene en mi camioneta" (c31). Revelación: se abre la puerta de la camioneta negra (i07, r4) y Efrén: "Es el del patrón Ezequías." (c32);
#   Hermelinda: "¿Tú le vendiste mi cosecha?" (c33). Castigo para la Parte 2. Navidad ligera: temporada de nochebuenas.
# Geografía fija en el patio del invernadero (valle de Atlixco, atardecer dorado):
#   los invernaderos con las filas de nochebuenas a la IZQUIERDA; la mesa de carga de madera al CENTRO; el portón de fierro y la camioneta negra de Nazario a la DERECHA; el Popocatépetl al fondo.
#   Efrén al CENTRO-IZQUIERDA frente a la puerta del invernadero; Nazario a la DERECHA junto a la mesa de carga; Rufina a la IZQUIERDA entre las filas de macetas.
#   Hermelinda (desde c22) al CENTRO frente al portón, sus camiones de redilas detrás. Ezequías (r4) junto a la puerta abierta de la camioneta negra.
#   c17-c18: el patio de la casona de Hermelinda (LOC_CASONA). CTA (c34): Hermelinda sola entre las nochebuenas, a cámara.
INV0 = ("at a poinsettia greenhouse in the Atlixco valley of Puebla @{LOC_INVERNADERO} at golden-hour dusk: long greenhouses of white plastic on metal arches full of rows of red poinsettias "
        "in black pots, a dirt yard with an old wooden loading table, an iron gate to a dirt road, the snowy Popocatépetl volcano far behind; "
        "no readable text, no signs, no logos")
INV = INV0 + "; nobody else in the background, no extras, nobody besides the person described"
CAS = ("in the courtyard of an old colonial house in Atlixco @{LOC_CASONA} at dusk: walls with blue-and-white talavera tiles, stone arches, a small stone fountain, "
       "potted red poinsettias, warm lamps; no logos, no readable text")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Hermelinda lleva abrigo gris carbón y broche de nochebuena; solo Nazario va rapado, con candado de barba y polo mostaza;
# solo Efrén camisa de mezclilla y mandil verde; solo Rufina trenza canosa y mandil de cuadros morados; solo Ezequías boina gris y barba blanca larga.
HER = ("@{HERMELINDA_CORONA} (67-year-old Mexican woman from Puebla, light-brown skin, tall and slim, upright, long face with fine wrinkles, silver-grey hair in a neat low bun, "
       "small pearl earrings, no glasses, no hat, a long charcoal-grey wool coat with a small red poinsettia brooch on the lapel, a cream high-neck blouse, her hands empty and low)")
EFR = ("@{EFREN_CUAUTLE} (46-year-old Mexican man, brown skin, stocky, round face, short curly black hair, thick black mustache, no hat, no glasses, "
       "a faded blue denim work shirt with rolled sleeves, a dark-green canvas work apron, his hands kept low)")
NAZ = ("@{NAZARIO_BRETON} (52-year-old Mexican man, light skin, tall and heavyset with a big belly, shaved bald head, thick black goatee, no hat, no glasses, "
       "a mustard-yellow polo shirt with no logo, dark jeans, one gold ring on his right hand, a gold chain bracelet, his hands kept low, he never points a finger at anyone)")
RUF = ("@{RUFINA_TECUAPETLA} (58-year-old Mexican woman, dark-brown skin, short and plump, round cheeks, a long grey braid, no hat, no glasses, "
       "a purple-and-white checked apron over a navy-blue dress, a grey cardigan, her hands kept low)")
EZE = ("@{EZEQUIAS_VILCHIS} (74-year-old Mexican man, fair weathered skin, thin and slightly hunched, long white hair combed back, a full long white beard, "
       "a grey tweed flat cap, a brown wool cardigan over a white shirt, grey trousers, his hands empty)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
PHONE_R = "one black phone held in her RIGHT hand"
KEYS_R = "one ring of three old iron keys with a small carved wooden poinsettia keychain held up in his RIGHT hand"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

EC = "standing at the CENTER-LEFT in front of the open greenhouse door, rows of red poinsettias behind him"                  # Efrén
NR = "standing on the RIGHT beside the old wooden loading table, a black pickup truck with no logos parked behind him"        # Nazario
RL = "standing on the LEFT between rows of red poinsettias in black pots"                                                     # Rufina
HC = "standing in the CENTER of the dirt yard in front of the iron gate, old stake-bed trucks loaded with red poinsettias behind her"  # Hermelinda
KEYS_SWING = "one ring of three old iron keys with a small carved wooden poinsettia keychain swinging slowly from a heavy hand with a gold ring"

CLIPS = [
 # 1. Gancho (0-2 s): la maceta rota, "hasta que den las seis"
 ("i01", 6, f"Close-up insert {INV0}: a heavy hand with a gold ring and a gold chain bracelet at the wrist of a mustard-yellow sleeve pushes one red poinsettia in a black pot "
            f"off the old wooden loading table; it falls and breaks on the dirt, soil and red leaves spill. Only the hand, the pot and the dirt, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, relaxed and sure of himself, a small mocking half smile", "LEFT",
     NODOUBLE("bald man in a mustard polo shirt")), "relaxed, mocking, unhurried, like he owns the place")),
 ("c02", 6, talk("c02", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, calm, he glances down at the broken pot on the ground", "RIGHT",
     NODOUBLE("man in a green apron")), "calm, quiet, firm")),
 ("c03", 6, talk("c03", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he tilts his head, cold", "LEFT"),
     "cold, sure")),
 ("c04", 6, talk("c04", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, he looks at the rows of poinsettias for a moment, then back, loyal", "RIGHT"),
     "loyal, slow, low")),
 ("c05", 6, talk("c05", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he spreads his arms a little, proud", "LEFT"),
     "proud, mocking")),
 ("c06", 6, talk("c06", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, suspicious, he frowns a little", "RIGHT"),
     "suspicious, calm, low")),
 ("c07", 6, talk("c07", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, with a sly smile he shows {KEYS_R}", "LEFT"),
     "sly, quiet, amused")),
 ("i02", 6, f"Close-up insert {INV0}: {KEYS_SWING}; the little wooden poinsettia is hand-carved and painted red. "
            f"Only the hand, the keys and the keychain, no faces, no letters. No dialogue."),
 ("c08", 6, talk("c08", "Rufina", one(f"Close-up of {RUF} {INV}, {RL}, the short plump woman with the grey braid and the purple checked apron is the one who speaks, worried, she speaks low and respectful; no bald man in the frame", "RIGHT",
     NODOUBLE("woman in a checked apron")), "worried, low, respectful")),
 ("c09", 6, talk("c09", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he turns his head sharply to his side, annoyed", "LEFT"),
     "annoyed, quick, low")),
 ("r1", 6, one(f"Close-up of {RUF} {INV}, {RL}, in silence, she lowers her eyes, then slips {PHONE_R} out of her apron pocket and hides it against her apron", "RIGHT") + " Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, he turns his eyes to his side and speaks low, decided", "LEFT"),
     "low, decided, quick")),
 ("c11", 6, talk("c11", "Rufina", one(f"Close-up of {RUF} {INV}, {RL}, she nods quickly and speaks very low", "RIGHT"),
     "very low, quick, determined")),
 ("c12", 6, talk("c12", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he laughs once, arrogant", "LEFT"),
     "amused, arrogant")),
 # 2. El plazo: las campanas de las seis
 ("c13", 6, talk("c13", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, very calm, a small sure smile under the mustache", "RIGHT"),
     "very calm, low, sure")),
 ("c14", 6, talk("c14", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he laughs and looks around at the empty road", "LEFT"),
     "mocking, amused")),
 ("c15", 6, talk("c15", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, calm, he glances up toward the town and the bell tower far away", "RIGHT"),
     "calm, slow, sure")),
 ("c16", 6, talk("c16", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he shrugs, smug, and crosses his arms", "LEFT"),
     "smug, dismissive")),
 # 3. Montaje paralelo: las campanas y la casona
 ("i03", 6, f"Low-angle shot at golden-hour dusk: the stone bell tower of an old church in Atlixco, Puebla, against an orange sky; the bronze bells start to swing and ring, "
            f"pigeons fly off, the snowy Popocatépetl volcano far behind. No people, no letters. No dialogue."),
 ("c17", 6, talk("c17", "Hermelinda", one(f"Close-up of {HER} {CAS}, she holds {PHONE_R} at her ear, her face turns serious and very calm", "LEFT",
     NODOUBLE("woman in a charcoal coat")), "serious, calm, low")),
 ("c18", 6, talk("c18", "Hermelinda", one(f"Close-up of {HER} {CAS}, she lowers the phone and turns her head to speak firmly to people off screen", "RIGHT"),
     "firm, quick, decided")),
 ("i04", 6, f"Aerial drone shot at golden-hour dusk over the Atlixco valley: a long line of old stake-bed trucks loaded with red poinsettias drive along a dirt road between green fields, "
            f"dust behind them, the snowy Popocatépetl volcano far behind. No people visible, no letters on the trucks. No dialogue."),
 # 4. Se acaba el tiempo: llegan los camiones del valle
 ("c19", 6, talk("c19", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, he checks one black phone in his RIGHT hand, then looks up, smug", "LEFT"),
     "smug, impatient")),
 ("c20", 6, talk("c20", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, a slow small smile, he lifts his eyes as if listening to faraway bells", "RIGHT"),
     "calm, quiet, sure")),
 ("c21", 6, talk("c21", "Rufina", one(f"Close-up of {RUF} {INV}, {RL}, she turns her head toward the road, alarmed", "RIGHT"),
     "alarmed, quick, low")),
 ("r2", 6, one(f"Close-up of {NAZ} {INV}, {NR}, in silence, his smile fades slowly and he turns his head toward the road", "LEFT") + " Slow push-in. No dialogue."),
 ("i05", 6, f"Wide shot {INV0}: a line of old stake-bed trucks loaded with red poinsettias stops on the dirt road by the iron gate in a cloud of dust; men and women in plain work clothes, "
            f"no hats, step down and stand still in a row, arms crossed in front of them; their hands are empty. No dialogue."),
 ("i06", 6, f"Close-up insert {INV0}: on the dirt, a broken black pot with a red poinsettia; a woman's hand with a charcoal-grey wool sleeve reaches down and gently lifts the poinsettia "
            f"from the spilled soil. Only the hand, the sleeve and the plant, no faces. No dialogue."),
 ("c22", 6, talk("c22", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, holding the rescued red poinsettia against her coat, very calm, cold eyes toward the man on her right", "RIGHT",
     NODOUBLE("woman in a charcoal coat")), "very calm, quiet, cold")),
 ("c23", 6, talk("c23", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, his face goes pale, nervous, he tries to smile", "LEFT"),
     "nervous, quick")),
 # 5. Hermelinda y Efrén (música cálida c24-c26)
 ("c24", 6, talk("c24", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, her eyes soft and warm, she looks toward the foreman on her left", "LEFT"),
     "warm, sincere, low")),
 ("c25", 6, talk("c25", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, moved, his eyes shine, he stands straight", "RIGHT"),
     "moved, quiet, proud")),
 ("c26", 6, talk("c26", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, she nods slowly with a small warm smile", "LEFT"),
     "warm, tender, low")),
 # 6. Inversión: el plazo cambia de lado (el castigo queda para la Parte 2)
 ("c27", 6, talk("c27", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, she turns her eyes slowly to the right, firm now", "RIGHT"),
     "firm, slow, low")),
 ("c28", 6, talk("c28", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, still and calm, she does not blink", "RIGHT"),
     "calm, final, slow")),
 ("c29", 6, talk("c29", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, his hands open and low, he tries to sound sure", "LEFT"),
     "defensive, quick")),
 ("c30", 6, talk("c30", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, she lifts her chin a little, serious", "RIGHT"),
     "serious, quiet, slow")),
 ("c31", 6, talk("c31", "Nazario", one(f"Close-up of {NAZ} {INV}, {NR}, nervous, he shows {KEYS_R} and glances over his shoulder at the black pickup behind him", "LEFT"),
     "nervous, low, quick")),
 # 7. La camioneta negra: gancho a la Parte 2
 ("r3", 6, one(f"Close-up of {HER} {INV0}, {HC}, in silence, she looks at the keys, then slowly at the black pickup, her calm face slowly turns serious", "RIGHT") + " Slow push-in. No dialogue."),
 ("i07", 6, f"Close-up insert {INV0}: the passenger door of a black pickup truck with no logos opens slowly; an old man's foot in a brown leather shoe and grey trousers steps down onto the dirt. "
            f"Only the door, the foot and the dust, no face. No dialogue."),
 ("r4", 6, one(f"Medium close-up of {EZE} {INV}, standing alone beside the open passenger door of a black pickup truck with no logos, already standing still from the first frame, "
               f"in silence, he lowers his eyes and pulls his flat cap down a little, ashamed", "LEFT") + " Slow push-in. No dialogue."),
 ("c32", 6, talk("c32", "Efrén", one(f"Close-up of {EFR} {INV}, {EC}, he holds up one ring of three old dark iron keys with a small carved red poinsettia keychain in his RIGHT hand, he looks at it and then at the old man, then lowers his eyes, sad", "RIGHT"),
     "sad, very low")),
 ("c33", 6, talk("c33", "Hermelinda", one(f"Close-up of {HER} {INV0}, {HC}, very still, her eyes on the old man by the pickup, then her face slowly breaks, hurt", "RIGHT"),
     "shocked, hurt, very low")),
 # CTA con carisma (después del BLACK): Hermelinda sola entre las nochebuenas, a cámara
 ("c34", 10, talk("c34", "Hermelinda", f"Close-up from the chest up of {HER} {INV}, alone, standing among the rows of red poinsettias, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a mischievous little smile, makes a short pause, raises one eyebrow, "
     f"touches the poinsettia brooch on her lapel, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful and mischievous, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly")
        ]
# Frases primero: si no, "hurt"/"nervous" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Usted no se meta, señora.", "Usted no opine, señora."), ("Tu patrona ya no decide nada.", "Tu patrona ya no está aquí."),
        ("O tu patrona se queda sin cosecha.", "O me firmas toda la cosecha."), ("¿Quién tiró mi nochebuena?", "¿Quién rompió mi nochebuena?"),
        ("Antes que den las siete, te vas del valle.", "Antes de las siete, te vas del valle."),
        ("his face goes pale", "his face turns serious"), ("then her face slowly breaks, hurt", "her face turns serious"),
        ("pushes one red poinsettia", "moves one red poinsettia"), ("it falls and breaks on the dirt, soil and red leaves spill", "it falls on the dirt"),
        ("he turns his head sharply", "he turns his head"), ("hides it against her apron", "holds it low"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("mischievous", "friendly"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm golden-hour dusk light at a greenhouse of red poinsettias in the Atlixco valley of Puebla, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a poinsettia greenhouse in Puebla at dusk with a volcano far behind, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HERMELINDA_CORONA}", "an elegant older Mexican woman with a silver bun in a charcoal-grey wool coat"), ("@{EFREN_CUAUTLE}", "a stocky Mexican man with a mustache in a denim shirt and a green apron"),
         ("@{NAZARIO_BRETON}", "a heavyset bald Mexican man with a black goatee in a mustard-yellow polo shirt"), ("@{RUFINA_TECUAPETLA}", "a short Mexican woman with a grey braid in a purple checked apron"),
         ("@{EZEQUIAS_VILCHIS}", "a thin old Mexican man with a long white beard and a grey flat cap"),
         (" @{LOC_INVERNADERO}", ""), (" @{LOC_CASONA}", "")]
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
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()
