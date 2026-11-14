"""Genera los clips de madrina-central PARTE 1 (La Madrina de la Central, historia propia tipo CAPOS, premisa 6 de fuentes/atrium-vista/resumen.md, SINMARCA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / buen-hijo-p2 c27 / mecanico c25 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25 / sazon-concha c16: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c13 / regreso-20 c28: frase repetida al final -> silencio tras la última palabra; QA regreso-20 c14/c22: 2ª frase perdida -> 8 s para dos frases
END = "After the last word the person stays silent until the end of the shot."
# Regla camionero v1: TODOS los planos hablados son de una sola persona (ONE + ALONE) con la mirada a un lado SIN nombrar al otro (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26: nadie entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Fórmula capos (resumen atrium-vista): gancho visual en 0-2 s (la grúa engancha el tráiler de Rubén) con cifra y plazo (ochenta mil, hasta las seis);
# poder SIN armas: cortinas de la Central que bajan, cargadores en fila de manos cruzadas, radio, libreta negra. Insertos i* sin caras y reacciones mudas r* para el ritmo de <=2 s por plano.
# Protagonista matriarca (doña Eva, la que decide quién vende); el agiotista es su ahijado; castigo para la Parte 2. Sin niños en cuadro (la hija recién nacida solo se nombra).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Patio de maniobras (i01, i02, c01-c08, r1, c21, c22, r3): Gaspar a la DERECHA junto a la grúa, mira a la IZQUIERDA; Rubén a la IZQUIERDA delante de su tráiler rojo, mira a la DERECHA;
#     Porfirio (c22) a la IZQUIERDA, mira a la DERECHA.
#   Bodega de Eva (resto): Eva sentada a la DERECHA tras el escritorio, mira a la IZQUIERDA; Rubén y luego Gaspar de pie a la IZQUIERDA frente al escritorio, miran a la DERECHA;
#     Porfirio en la cortina abierta: mira a la DERECHA cuando le habla a Eva, a la IZQUIERDA cuando habla con Rubén o por radio. CTA (c36): Eva sola tras su escritorio, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin marcas, sin precios, sin números.
PAT0 = ("in the loading yard @{LOC_PATIOCENTRAL} of a big wholesale produce market in Mexico in the late afternoon: grey concrete ground, stacked wooden crates of tomatoes "
        "and oranges, huge grey metal roll-up doors, a few parked trucks far behind; warm golden light; no readable text, no signs, no logos, no prices, no license plates")
PAT = PAT0 + "; no extras, nobody else in the yard besides the person described"
BOD = ("inside the produce warehouse @{LOC_BODEGAEVA} of the wholesale market: stacked wooden crates of oranges and tomatoes, one plain old wooden desk, one bare light bulb hanging, "
       "an open metal roll-up door far behind; warm light; no readable text, no signs, no logos, no prices, no calendar; nobody else in the warehouse besides the person described")
# Anclas de identidad y ropa. Solo Eva es mujer y lleva chongo negro y aretes de oro; solo Porfirio gorra y bigote gris; solo Gaspar cabeza rapada y cadena de oro; solo Rubén barba y mezclilla.
# Nadie con lentes. Manos abiertas, nadie señala con el dedo. Sin uniformes, gafetes ni letras en la ropa. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
EVA = ("@{EVA_SALDIVAR} (70-year-old Mexican woman, light brown skin, strong square face with fine lines, dyed jet-black hair pulled back in a neat high bun, big gold hoop earrings, "
       "dark red lipstick, no hat, no glasses, black cardigan over a wine-red blouse, several thin gold bracelets on her left wrist, her hands calm)")
RUB = ("@{RUBEN_GALINDO} (30-year-old Mexican man, clearly an adult, brown skin, tired kind face, short black hair, short black beard, no hat, no glasses, "
       "faded blue denim shirt over a plain white t-shirt, his hands kept low)")
GAS = ("@{GASPAR_LEYVA} (45-year-old Mexican man, light skin, smug narrow face, shaved head, thin black goatee, no hat, no glasses, cream western shirt with black embroidery on the chest, "
       "one thick gold chain on his neck, one gold wristwatch, his hands kept low, he never points a finger at anyone)")
POR = ("@{PORFIRIO_TAPIA} (56-year-old Mexican man, dark tan skin, serious calm face, thick grey mustache, a black flat cap, no glasses, navy blue work jacket over a grey shirt, "
       "one black handheld radio clipped to his chest, his hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
TRUCK = "one old red tractor-trailer cab with no logo"
KEYS = "one key ring with two keys"
KEYSH = "one key ring with two keys held in his RIGHT hand"
LEDGER = "one thick black ledger notebook"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / camionetas c28: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

GR = "standing on the RIGHT beside a white tow truck"                       # Gaspar en el patio
RL = f"standing on the LEFT, {TRUCK} behind him"                            # Rubén en el patio
PL = "standing on the LEFT in the loading yard"                             # Porfirio en el patio
ED = f"seated on the RIGHT behind the plain wooden desk, {LEDGER} in front of her"  # Eva
RB = "standing on the LEFT in front of the wooden desk"                     # Rubén en la bodega
GB = "standing on the LEFT in front of the wooden desk"                     # Gaspar en la bodega
PD = "standing by the open metal roll-up door of the warehouse"             # Porfirio en la bodega

CLIPS = [
 # 1. Gancho (0-2 s): la grúa engancha el tráiler; Gaspar pone precio y plazo
 ("i01", 6, f"Close-up insert {PAT0}: the steel hook and chain of a white tow truck lock onto the front bumper of {TRUCK}; the chain pulls tight. "
            f"Only the hook, the chain and the bumper, no faces. No dialogue."),
 ("c01", 8, talk("c01", "Gaspar", one(f"Close-up of {GAS} {PAT}, {GR}, {KEYSH}, a smug smile", "LEFT",
     NODOUBLE("man in a cream western shirt")), "smug, cold, unhurried")),
 ("c02", 8, talk("c02", "Rubén", one(f"Close-up of {RUB} {PAT}, {RL}, desperate, his hands open and low", "RIGHT",
     NODOUBLE("man in a denim shirt")), "desperate, pleading, quick")),
 ("c03", 6, talk("c03", "Gaspar", one(f"Close-up of {GAS} {PAT}, {GR}, he laughs once, mocking", "LEFT"),
     "mocking, cold")),
 ("i02", 6, f"Close-up insert {PAT0}: a hand with one gold wristwatch dangles {KEYS}, then closes the fist around them. Only the hand and the keys, no faces. No dialogue."),
 ("c04", 6, talk("c04", "Rubén", one(f"Close-up of {RUB} {PAT}, {RL}, upset, his jaw tight; he is a 30-year-old man with short black hair and a short black beard, NOT an old man: no hat of any kind, no bolo tie, no suede jacket, no white beard", "RIGHT",
     NODOUBLE("man in a denim shirt")), "upset, firm")),
 ("c05", 8, talk("c05", "Gaspar", one(f"Close-up of {GAS} {PAT}, {GR}, {KEYSH}, he leans forward a little, cocky", "LEFT"),
     "cocky, mocking, slow")),
 ("r1", 6, one(f"Close-up of {RUB} {PAT}, {RL}, in silence, he looks down, his jaw tight, his eyes shine", "RIGHT") + " Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Gaspar", one(f"Close-up of {GAS} {PAT}, {GR}, proud, he opens his arms a little", "LEFT"),
     "proud, smug")),
 ("c07", 6, talk("c07", "Rubén", one(f"Close-up of {RUB} {PAT}, {RL}, he raises his eyes, serious and sure", "RIGHT"),
     "serious, quiet, sure")),
 ("c08", 6, talk("c08", "Gaspar", one(f"Close-up of {GAS} {PAT}, {GR}, he laughs, mocking", "LEFT"),
     "mocking, amused")),
 # 2. La bodega: Rubén busca a doña Eva
 ("i03", 6, f"Close-up insert {BOD}: a woman's hand with several thin gold bracelets turns a page of {LEDGER} on the plain wooden desk; no readable text, "
            f"only the hand and the ledger, no faces. No dialogue."),
 ("c09", 6, talk("c09", "Porfirio", one(f"Close-up of {POR} {BOD}, {PD}, he blocks the way calmly, serious", "LEFT",
     NODOUBLE("man in a black flat cap")), "serious, low, calm")),
 ("c10", 8, talk("c10", "Rubén", one(f"Close-up of {RUB} {BOD}, {RB}, respectful, his hands low", "RIGHT",
     NODOUBLE("man in a denim shirt")), "respectful, nervous")),
 ("c11", 6, talk("c11", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she raises her eyes from the ledger, a warm surprise", "LEFT",
     NODOUBLE("woman with a black bun")), "warm, surprised, firm")),
 ("c12", 8, talk("c12", "Rubén", one(f"Close-up of {RUB} {BOD}, {RB}, his eyes shine, he speaks low", "RIGHT"),
     "hurt, quiet")),
 ("r2", 6, one(f"Close-up of {EVA} {BOD}, {ED}, in silence, she stops reading and slowly closes the ledger with one hand, her face hard", "LEFT") + " Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, serious, her hands flat on the closed ledger", "LEFT"),
     "serious, dry, low")),
 ("c14", 6, talk("c14", "Rubén", one(f"Close-up of {RUB} {BOD}, {RB}, ashamed, he looks down and back", "RIGHT"),
     "ashamed, quiet")),
 ("c15", 6, talk("c15", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she turns her eyes toward the door, serious", "LEFT"),
     "serious, calm")),
 ("c16", 6, talk("c16", "Porfirio", one(f"Close-up of {POR} {BOD}, {PD}, serious", "RIGHT"),
     "serious, low")),
 ("c17", 6, talk("c17", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, a cold small smile", "LEFT"),
     "cold, calm, slow")),
 ("c18", 6, talk("c18", "Porfirio", one(f"Close-up of {POR} {BOD}, {PD}, he touches the radio on his chest", "RIGHT"),
     "low, quick")),
 ("c19", 8, talk("c19", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she rises slowly behind the desk, her voice low and final", "LEFT"),
     "low, final, the one who is in charge")),
 # 3. Las puertas: la Central se cierra
 ("i04", 6, f"Wide shot {PAT0}: the huge grey metal roll-up doors of the market come down one after another, dust in the golden light; nobody in front of them. No dialogue."),
 ("c20", 6, talk("c20", "Porfirio", one(f"Close-up of {POR} {BOD}, {PD}, he speaks into the radio on his chest, calm", "LEFT"),
     "calm, firm, low")),
 ("i05", 6, f"Medium wide shot {PAT0}: a row of market porters in plain grey work clothes stand still beside their hand trucks loaded with crates, hands crossed in front of them, "
            f"calm faces, blocking the lane; their hands are empty, no weapons. No dialogue."),
 # 4. Gaspar encerrado; frente a su madrina
 ("c21", 6, talk("c21", "Gaspar", one(f"Close-up of {GAS} {PAT}, {GR}, nervous, he looks at the closed doors and back", "LEFT"),
     "nervous, upset")),
 ("c22", 6, talk("c22", "Porfirio", one(f"Close-up of {POR} {PAT}, {PL}, very calm", "RIGHT",
     NODOUBLE("man in a black flat cap")), "calm, dry, low")),
 ("r3", 6, one(f"Close-up of {GAS} {PAT}, {GR}, in silence, his smug smile fades, he looks at the closed metal doors and swallows", "LEFT") + " Slow push-in. No dialogue."),
 ("c23", 6, talk("c23", "Gaspar", one(f"Close-up of {GAS} {BOD}, {GB}, nervous, forcing a smile", "RIGHT",
     NODOUBLE("man in a cream western shirt")), "nervous, forced, quick")),
 ("c24", 6, talk("c24", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, seated, she places one open hand flat on the desk", "LEFT"),
     "calm, cold")),
 ("i06", 6, f"Close-up insert {BOD}: a hand with one gold wristwatch sets {KEYS} on the plain wooden desk beside {LEDGER}, closed. "
            f"Only the hand, the keys and the ledger, no faces. No dialogue."),
 ("c25", 6, talk("c25", "Gaspar", one(f"Close-up of {GAS} {BOD}, {GB}, his hands open, a false sweet smile", "RIGHT"),
     "false, sweet, nervous")),
 ("c26", 8, talk("c26", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she looks at him, disappointed", "LEFT"),
     "disappointed, low, slow")),
 ("c27", 8, talk("c27", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she taps the closed ledger once with two fingers", "LEFT"),
     "cold, hurt, firm")),
 ("c28", 6, talk("c28", "Gaspar", one(f"Close-up of {GAS} {BOD}, {GB}, defensive, he shrugs", "RIGHT"),
     "defensive, proud")),
 ("c29", 8, talk("c29", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, her voice low and hard", "LEFT"),
     "hard, low, final")),
 # 5. El plazo se invierte (el castigo queda para la Parte 2)
 ("c30", 6, talk("c30", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she looks at him without blinking", "LEFT"),
     "calm, final, slow")),
 ("c31", 8, talk("c31", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, she slides {KEYS} across the desk with one hand", "LEFT"),
     "firm, calm")),
 ("r4", 6, one(f"Close-up of {GAS} {BOD}, {GB}, in silence, he looks down at the keys on the desk and swallows", "RIGHT") + " Slow push-in. No dialogue."),
 ("c32", 6, talk("c32", "Gaspar", one(f"Close-up of {GAS} {BOD}, {GB}, worried, pleading, his hands open and low", "RIGHT"),
     "pleading, worried")),
 # 6. Momento cálido: el papá de Rubén cargó para Eva sin cobrar
 ("c33", 8, talk("c33", "Rubén", one(f"Close-up of {RUB} {BOD}, {RB}, sincere and tired", "RIGHT"),
     "sincere, tired, quiet")),
 ("c34", 8, talk("c34", "Eva", one(f"Close-up of {EVA} {BOD}, {ED}, her eyes soft, a small warm smile", "LEFT"),
     "warm, grateful, low")),
 ("r5", 6, one(f"Close-up of {RUB} {BOD}, {RB}, in silence, his eyes shine, he nods slowly", "RIGHT") + " Slow push-in. No dialogue."),
 # 7. Gancho: la comadre llega a la puerta
 ("c35", 8, talk("c35", "Porfirio", one(f"Close-up of {POR} {BOD}, {PD}, worried, he lowers his hand from the radio and speaks low", "RIGHT"),
     "worried, a whisper")),
 # CTA con carisma (después del BLACK): Eva tras su escritorio, a cámara
 ("c36", 10, talk("c36", "Eva", f"Medium close-up of {EVA} {BOD}, alone, seated behind the plain wooden desk, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she plays with her gold bracelets, tilts her head, "
     f"raises her eyebrows, nods and smiles a little. Nobody else in the warehouse.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly"), ("brake hard", "stop")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("controlled", "calm"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("holds firmly", "rests on"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("Cobra los lunes en el andén.", "Pasa los lunes por el andén."), ("Ándale, ve a llorarle.", "Ándale, ve a contarle."),
        ("Me va a dejar en la calle.", "Me va a dejar sin nada."), ("lock onto", "hook onto"), ("he blocks the way calmly", "he stands calmly")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a big wholesale produce market in Mexico in the late afternoon, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{EVA_SALDIVAR}", "an older Mexican businesswoman"), ("@{RUBEN_GALINDO}", "a Mexican truck driver"),
         ("@{GASPAR_LEYVA}", "a Mexican moneylender"), ("@{PORFIRIO_TAPIA}", "a Mexican market foreman"),
         (" @{LOC_PATIOCENTRAL}", ""), (" @{LOC_BODEGAEVA}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END, NOSUB y CLEAN quedan, van después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:  # entorno explícito y tope de 10 min por llamada (flow.js ya corta a los 90 s por video)
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control (regla del usuario): si un clip falla, generar algo neutro para saber si falla el prompt o Flow."""
    # gatito como IMAGEN (no gasta créditos; el video costaba 12-15 por prueba)
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
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1  # regenerar: guardar la versión anterior
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            files, log = gen(variant(body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"  # MP4 que no decodifica: reintentar
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()  # Flow no se desbloquea esperando: recargar la página
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0  # recargar no bastó: proyecto nuevo + volver a subir hojas
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()
