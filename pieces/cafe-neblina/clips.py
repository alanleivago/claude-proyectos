"""Genera los clips de cafe-neblina PARTE 1 (La Neblina, remake transformado de "Me dejó la hacienda vacía y una deuda escondida" de @atriumstories_, sierra de Veracruz, MEXI) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de cenote-campana (todas sus defensas: gatito en imagen, control de duplicados md5). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (las botas del coyote pisan el café tendido de Brígida) con figura y plazo ("Mañana te vas, Brígida");
# poder SIN armas: tres camionetas verde oscuro por la sierra con neblina, hombres de camisa verde con las manos cruzadas, el sombrero panamá de don Gaudencio. Insertos i* sin caras y reacciones r* mudas.
# El coyote llama él mismo a su "patrón" para presumir la finca y el patrón resulta ser el padrino de Brígida (c14-c18).
# Indicios del giro ANTES de revelarlo: "tu marido la empeñó" (c03), la firma con fecha del martes de un hombre que se fue hace dos años (c05, i02, r1, c06),
#   "pregúntale a él" (c07), "el de atrás" que no debe bajarse (c08, c09), el sombrero de banda azul en el tablero y la silueta tras el vidrio (r2, i03, c10),
#   "me la mandaron" (c31, r4) y Toribio: "no nos dejó decirle" (c32). Revelación: Nemesio baja de la camioneta del coyote (r5) y Brígida: "¿Tú no estabas en el norte?" (c34). Castigo para la Parte 2.
# Sin Navidad. Geografía fija en el patio de secado de La Neblina (sierra central de Veracruz, mañana con neblina):
#   la casita de madera con techo de lámina a la IZQUIERDA; Brígida al CENTRO-IZQUIERDA frente al corredor de la casita; Lamberto a la DERECHA sobre el café tendido;
#   Toribio a la DERECHA junto a la pickup gris de vidrios polarizados (la de Lamberto). Gaudencio (desde c22) al CENTRO, sus tres camionetas verde oscuro detrás;
#   Silvano a la DERECHA cerca de las camionetas verdes; Nemesio (r5) a la DERECHA junto a la puerta trasera abierta de la pickup gris.
#   c15-c18: porche del beneficio viejo de don Gaudencio (LOC_BENEFICIO). CTA (c35): Brígida sola en el patio, a cámara.
PAT0 = ("on the coffee drying patio of a small farm in the misty green mountains of central Veracruz @{LOC_PATIOCAFE} on a cool morning: a wide grey concrete patio covered with "
        "coffee beans spread out to dry, a small wooden house with a tin roof and a narrow porch on the left, coffee bushes and banana plants around, soft mist on the mountains behind; "
        "no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
BEN = ("on the covered porch of an old coffee mill in the mountains of Veracruz @{LOC_BENEFICIO}: old white plaster walls, dark wooden beams, a tall tin roof, stacks of plain jute coffee sacks "
       "with no letters, a wooden desk with an old scale, a green valley with mist beyond the porch, morning light; no logos, no readable text")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Gaudencio lleva sombrero puesto (panamá crema); el sombrero de palma con banda azul es de Nemesio (tablero en i03, en sus manos en r5);
# solo Brígida trenza larga y mandil café; solo Lamberto camisa vaquera vino con vivos blancos y cadena de oro; solo Toribio calvo y camisa de mezclilla; solo Silvano polo verde oscuro.
BRI = ("@{BRIGIDA_OLMOS} (46-year-old Mexican woman from the mountains of Veracruz, light-brown skin, strong cheekbones, a few freckles, black hair in one long braid with grey strands, "
       "small gold hoop earrings, no hat, no glasses, a faded mustard-yellow blouse, a light-brown work apron with deep pockets, a dark-blue skirt, dark-green rubber boots, her hands kept low)")
LAM = ("@{LAMBERTO_GAONA} (50-year-old Mexican man, light skin, heavy jowls, thick black mustache, short black hair combed back, no hat, no glasses, "
       "a wine-red western shirt with white piping, a thin gold chain, a big silver belt buckle, muddy brown boots, his hands kept low, he never points a finger at anyone)")
TOR = ("@{TORIBIO_LIRA} (58-year-old Mexican man, dark-brown skin, thin, sunken cheeks, bald head, short grey stubble beard, no hat, no glasses, "
       "a faded light-blue denim work shirt with rolled sleeves, his hands kept low)")
GAU = ("@{GAUDENCIO_ARRIETA} (74-year-old Mexican man, light-brown skin, tall and thin, long serene face, thick white mustache, deep wrinkles around calm eyes, "
       "a cream panama hat with a black band, a white long-sleeve shirt under a dark-brown wool vest, cream trousers, his hands empty)")
SIL = ("@{SILVANO_JACOME} (45-year-old Mexican man, brown skin, stocky, round clean-shaven face, short black hair, no hat, no sunglasses, "
       "a dark-green polo shirt with no logo, khaki trousers, his hands crossed in front of him)")
NEM = ("@{NEMESIO_TLAPA} (49-year-old Mexican man, brown skin, gaunt, three-day stubble, messy black hair, tired eyes, "
       "a wrinkled light-blue denim jacket over a white t-shirt, holding a palm-leaf hat with a woven blue band low in both hands)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
PAPER = "one folded white paper held low in his RIGHT hand"
PHONE_L = "one black phone pressed to his ear in his LEFT hand"
PHONE_G = "one old black phone held in his RIGHT hand"
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

BS = "standing at the CENTER-LEFT of the patio in front of the porch of the small wooden house"     # Brígida
LR = "standing on the RIGHT of the patio on the spread coffee beans"                                # Lamberto
TR = "standing on the RIGHT beside a parked grey pickup truck with dark tinted rear windows"        # Toribio
GC = "standing in the CENTER of the patio, three dark-green pickup trucks parked far behind him"    # Gaudencio
SR = "standing on the RIGHT near three parked dark-green pickup trucks"                             # Silvano

CLIPS = [
 # 1. Gancho (0-2 s): las botas sobre el café tendido, "mañana te vas"
 ("i01", 6, f"Close-up insert {PAT0}: a pair of muddy brown cowboy boots under dark jeans walks straight across the coffee beans spread out to dry, leaving deep tracks, "
            f"and stops right in front of a pair of dark-green rubber boots that stay still. Only the boots and the coffee beans, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, calm and confident, a small proud half smile", "LEFT",
     NODOUBLE("man in a wine-red shirt")), "calm, confident, unhurried, like a boss")),
 ("c02", 6, talk("c02", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, holding back her feelings, she glances down at the boot tracks in her coffee", "RIGHT",
     NODOUBLE("woman with a long braid")), "hurt, firm, quiet")),
 ("c03", 6, talk("c03", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, he tilts his head, cold", "LEFT"),
     "cold, sure")),
 ("c04", 6, talk("c04", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, surprised and serious, she shakes her head slowly", "RIGHT"),
     "surprised, serious, low")),
 ("c05", 6, talk("c05", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, he lifts {PAPER} to chest height and shows it, mocking", "LEFT"),
     "mocking, cold")),
 ("i02", 6, f"Close-up insert {PAT0}: a man's thick hand with a gold chain at the wrist of a wine-red sleeve holds open one folded white paper with a blue ink signature "
            f"and a few handwritten lines that cannot be read. Only the hand and the paper, no faces. No dialogue."),
 ("r1", 6, one(f"Close-up of {BRI} {PAT}, {BS}, in silence, she reads something at chest height, her eyes narrow and her brow tightens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, she lifts her eyes slowly, suspicious", "RIGHT"),
     "suspicious, sharp, low")),
 ("c07", 6, talk("c07", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, {PAPER}, he shrugs once, a cold little smile", "LEFT"),
     "cold, dismissive, short")),
 ("c08", 6, talk("c08", "Toribio", one(f"Close-up of {TOR} {PAT}, {TR}, uneasy, he glances back at the truck", "LEFT",
     NODOUBLE("bald man in a denim shirt")), "uneasy, quiet, respectful")),
 ("c09", 6, talk("c09", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, he turns his head sharply, annoyed, speaking low", "RIGHT"),
     "annoyed, low, quick")),
 ("r2", 6, one(f"Close-up of {BRI} {PAT}, {BS}, in silence, she looks past the camera toward a parked truck, her eyes narrow slowly, she has noticed something", "RIGHT") + " Slow push-in. No dialogue."),
 ("i03", 6, f"Close-up insert {PAT0}: through the windshield of a parked grey pickup truck, a palm-leaf hat with a woven blue band rests on the dashboard; "
            f"behind it the dark tinted rear window shows only a blurred still shape. Only the truck, the hat and the glass, no faces, no letters. No dialogue."),
 ("c10", 6, talk("c10", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, quiet and puzzled, she keeps looking toward the truck", "RIGHT"),
     "puzzled, quiet, slow")),
 ("c11", 6, talk("c11", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, {PAPER}, he steps half a pace to block her view, cold and quick", "LEFT"),
     "quick, cold")),
 # 2. El comprador: el coyote llama él mismo a su patrón
 ("c12", 6, talk("c12", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, she lifts her chin, calm and firm", "RIGHT"),
     "calm, firm")),
 ("c13", 6, talk("c13", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, he laughs once, amused and arrogant", "LEFT"),
     "amused, arrogant")),
 ("c14", 6, talk("c14", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, he has turned half away and talks into {PHONE_L}, a satisfied smile", "RIGHT"),
     "pleased, servile, a little loud")),
 # 3. Montaje paralelo: el beneficio de don Gaudencio
 ("c15", 6, talk("c15", "Gaudencio", one(f"Close-up of {GAU} {BEN}, {PHONE_G} at his ear, his face slowly turns serious; he says each sentence only once, no repeated words", "LEFT",
     NODOUBLE("old man in a panama hat")), "serious, slow, very low, the one who is in charge")),
 ("c16", 6, talk("c16", "Gaudencio", one(f"Close-up of {GAU} {BEN}, he lowers {PHONE_G} and speaks firmly to someone off screen", "RIGHT"),
     "firm, quick, low")),
 ("c17", 6, talk("c17", "Silvano", one(f"Close-up of {SIL} {BEN}, he has just stopped, serious and quick", "LEFT",
     NODOUBLE("man in a dark-green polo")), "serious, quick, respectful")),
 ("c18", 6, talk("c18", "Gaudencio", one(f"Close-up of {GAU} {BEN}, he puts on his panama hat with one hand, calm and decided", "RIGHT"),
     "calm, decided, low")),
 ("i04", 6, f"Aerial drone shot on a misty morning over coffee plantations in the green mountains of Veracruz: three dark-green pickup trucks with no logos leave an old white coffee mill "
            f"and drive in a line up a winding mountain road through the mist. No people visible, no letters on the trucks. No dialogue."),
 # 4. La llegada: camionetas verdes, el panamá, el café pisado
 ("c19", 6, talk("c19", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, he slips the phone into his pocket, smug and sure", "LEFT"),
     "smug, sure")),
 ("c20", 6, talk("c20", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, a very small knowing smile appears slowly", "RIGHT"),
     "calm, quiet, sure")),
 ("r3", 6, one(f"Close-up of {TOR} {PAT}, {TR}, in silence, he looks down the mountain road and his face goes serious, a light breeze, mist behind", "LEFT") + " Slow push-in. No dialogue."),
 ("i05", 6, f"Wide shot {PAT0}: three dark-green pickup trucks stop at the edge of the patio; men in plain dark-green shirts, no hats, step out "
            f"and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("i06", 6, f"Close-up insert {PAT0}: old brown leather boots under cream trousers step down from a dark-green pickup onto the coffee patio and stop beside deep boot tracks; "
            f"an old hand bends down and picks up a few crushed coffee beans. Only the boots, the hand and the beans, no faces. No dialogue."),
 ("c21", 6, talk("c21", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, {PAPER}, eager, a big forced smile", "LEFT"),
     "eager, quick, polite")),
 ("c22", 6, talk("c22", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, he ignores the man on his right and looks with warmth toward the woman on his left", "LEFT",
     NODOUBLE("old man in a panama hat")), "warm, low, protective")),
 ("c23", 6, talk("c23", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, his smile freezes, nervous", "LEFT"),
     "nervous, quick")),
 # 5. El padrino (música cálida c24-c25)
 ("c24", 6, talk("c24", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, his eyes soft, he glances at the small wooden house", "LEFT"),
     "warm, sincere, low")),
 ("c25", 6, talk("c25", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, moved, her eyes shine, a small grateful smile", "RIGHT"),
     "moved, quiet, proud")),
 # 6. Inversión: el plazo cambia de lado (el castigo queda para la Parte 2)
 ("c26", 6, talk("c26", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, he turns his eyes slowly to his left, firm again", "RIGHT"),
     "firm, slow, low")),
 ("c27", 6, talk("c27", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, still and calm, he does not blink", "RIGHT"),
     "calm, final, slow")),
 ("c28", 6, talk("c28", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, {PAPER}, pleading, he lifts the paper a little", "LEFT"),
     "pleading, quick")),
 ("c29", 6, talk("c29", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, he holds out his open right hand, calm", "RIGHT"),
     "calm, low, slow")),
 ("i07", 6, f"Close-up insert {PAT0}: an old light-brown hand at the cuff of a white shirt and a dark-brown wool vest unfolds one white paper; the thumb stops on a blue ink signature. "
            f"Only the hand and the paper, no readable words, no faces. No dialogue."),
 ("c30", 6, talk("c30", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, he looks up from the paper slowly, suspicious", "RIGHT"),
     "quiet, suspicious, slow")),
 ("c31", 6, talk("c31", "Lamberto", one(f"Close-up of {LAM} {PAT}, {LR}, his hands empty and low, nervous, he avoids looking", "LEFT"),
     "nervous, quick, low")),
 ("r4", 6, one(f"Close-up of {LAM} {PAT}, {LR}, in silence, he swallows and glances over his shoulder toward a parked grey truck", "LEFT") + " Slow push-in. No dialogue."),
 ("c32", 6, talk("c32", "Toribio", one(f"Close-up of {TOR} {PAT}, {TR}, ashamed, he takes a breath and speaks", "LEFT"),
     "ashamed, quiet, honest")),
 ("c33", 6, talk("c33", "Gaudencio", one(f"Close-up of {GAU} {PAT0}, {GC}, he turns his head to his right, cold and final", "RIGHT"),
     "cold, final, low")),
 # 7. Nemesio baja de la camioneta: gancho a la Parte 2
 ("r5", 6, one(f"Medium close-up of {NEM} {PAT}, standing on the RIGHT beside the open rear door of a grey pickup truck, already standing still from the first frame, "
               f"in silence, he keeps his head low and does not look up", "LEFT") + " Slow push-in. No dialogue."),
 ("c34", 6, talk("c34", "Brígida", one(f"Close-up of {BRI} {PAT}, {BS}, frozen, her eyes wide, then her face slowly breaks, hurt", "RIGHT"),
     "shocked, hurt, very low")),
 # CTA con carisma (después del BLACK): Brígida en su patio, a cámara
 ("c35", 10, talk("c35", "Brígida", f"Medium close-up of {BRI} {PAT}, alone, standing on her coffee patio in front of the small wooden house, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she pushes her braid over her shoulder, wipes her hands on her apron, "
     f"tilts her head, raises her eyebrows, nods and smiles a little. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"),
        ("walks straight across", "walks across"), ("leaving deep tracks", "leaving tracks"), ("crushed coffee beans", "coffee beans")]
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("Son trescientos mil, Brígida.", "Esa es la deuda, Brígida."), ("Tu marido la empeñó.", "Tu marido la dejó firmada."),
        ("Me está pisando el café.", "Está caminando en mi café."), ("¿Quién te pisó el café, ahijada?", "¿Quién te maltrató el café, ahijada?"),
        ("to block her view", ""), ("her face slowly breaks, hurt", "her face turns serious"), ("frozen, her eyes wide", "very still"),
        ("his smile freezes", "his smile fades"), ("he swallows and", "he")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft misty morning light in the coffee mountains of Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a small coffee farm in the mountains of Veracruz on a misty morning, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft morning light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{BRIGIDA_OLMOS}", "a Mexican farm woman with a long braid and a brown apron"), ("@{LAMBERTO_GAONA}", "a Mexican coffee buyer in a wine-red western shirt"),
         ("@{TORIBIO_LIRA}", "a bald Mexican driver in a denim shirt"), ("@{GAUDENCIO_ARRIETA}", "an elegant old Mexican man in a cream panama hat"),
         ("@{SILVANO_JACOME}", "a Mexican man in a dark-green polo shirt"), ("@{NEMESIO_TLAPA}", "a tired Mexican man in a denim jacket"),
         (" @{LOC_PATIOCAFE}", ""), (" @{LOC_BENEFICIO}", "")]
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
