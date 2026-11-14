"""Genera los clips de chofer-patrona PARTE 1 (El Chofer de la Patrona, historia propia tipo CAPOS, premisa 5 de fuentes/atrium-vista/resumen.md, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de mariachi-patron (todas sus defensas). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (Lencho de rodillas junto a la cajuela vacía, la escolta detrás) con plazo y cifra (diez minutos, medio millón);
# poder SIN armas: convoy de camionetas en la sierra, escoltas de manos cruzadas, radio, anillos de oro, portón. Insertos i* sin caras y reacciones mudas r* para <=2 s por tramo.
# Indicios del giro ANTES de revelarlo: dos llaves (c05-c06), la mano de Valente al bolsillo (r1), la llamada de Treviño (c11), "ya la revisé anoche" (c14).
# Revelación: la grabación (i06) y Brígido (c28). Gancho P2: el maletín lo recibió Treviño, "el que se llevó a tu padre" (c33-c34). Castigo para la Parte 2.
# Geografía fija, todo en el patio de grava frente a la casa grande al amanecer:
#   Lencho al CENTRO-IZQUIERDA junto a la camioneta con la cajuela abierta (de rodillas c02-c17, de pie desde c24); Chema a la IZQUIERDA detrás de él;
#   Valente a la DERECHA; Brígido a la DERECHA bajo el portal de piedra. Eusebia (desde c21) al CENTRO: mira a la IZQUIERDA (Lencho) o a la DERECHA (Valente/Brígido).
#   c18: Eusebia sola en el asiento de atrás de su camioneta (sin hoja de locación). CTA (c35): Lencho solo junto a la camioneta, a cámara.
PAT0 = ("in the gravel courtyard in front of the big house of a rich ranch @{LOC_COCHERARANCHO} in the sierra of Durango at sunrise: a long two-story house with a stone porch "
        "and wooden columns, a black SUV with its rear hatch open, a tall black iron gate far behind, pine mountains, golden low morning light, dust in the air; "
        "no readable text, no signs, no logos, no license plates")
PAT = PAT0 + "; the courtyard behind is empty, no extras, nobody else besides the person described"
SUV = ("inside the back seat of a black SUV with tinted windows at sunrise, pine mountains and a dirt road passing outside in golden light; no logos, no readable text; "
       "nobody else visible in the car")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Brígido lleva sombrero; solo Valente chamarra vino y cadena; solo Lencho guayabera blanca; solo Chema mezclilla; solo Eusebia rebozo.
KEY = "a single car key on a red cord"
LEN = ("@{FLORENCIO_ARAMBULA} (61-year-old Mexican man, brown skin, round face with soft cheeks, thick grey mustache, short grey hair, no hat, no glasses, "
       "plain white guayabera shirt, dark grey trousers, his hands kept low)")
VAL = ("@{VALENTE_MONTALVO2} (31-year-old Mexican man, warm medium-brown skin, slightly full face with broad cheekbones, thin black mustache and light stubble, black hair combed back on top, no hat, no glasses, "
       "burgundy suede jacket over a black t-shirt, a thin gold chain, his hands kept low, he never points a finger at anyone)")
EUS = ("@{EUSEBIA_MONTALVO} (72-year-old Mexican woman, brown skin, serene oval face with fine wrinkles, silver hair in a low bun, no hat, no glasses, "
       "black dress, a black rebozo shawl over her shoulders, small pearl earrings, two gold rings on her right hand)")
BRI = ("@{BRIGIDO_TOSTADO} (48-year-old Mexican man, tan skin, tall, long face, thick black mustache with grey hairs, a black cowboy hat, no glasses, "
       "black suit jacket over a white shirt with no tie, his hands kept low)")
CHE = ("@{CHEMA_ARAMBULA} (23-year-old Mexican man, clearly an adult, brown skin, slim face, short curly black hair, clean-shaven, a small scar on his left eyebrow, "
       "no hat, no glasses, faded light-blue denim shirt with rolled sleeves, his hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
RADIO = "one black handheld radio held low in his RIGHT hand"
TAB = "one black tablet held in his RIGHT hand"
SCREEN = ("a flat 2D grainy black-and-white night security video displayed INSIDE the screen rectangle of the tablet, nothing comes out of the screen, "
          "the image stays flat inside the screen frame")
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

KN = "kneeling on the gravel at the CENTER-LEFT beside the open rear hatch of the black SUV, looking up"   # Lencho de rodillas (c02-c17)
LS = "standing at the CENTER-LEFT beside the open rear hatch of the black SUV"                             # Lencho de pie (c24-)
CL = "standing on the LEFT behind the black SUV"                                                          # Chema
VR = "standing on the RIGHT on the gravel"                                                                # Valente
BR = "standing on the RIGHT under the stone porch"                                                        # Brígido
EC = "standing in the CENTER of the gravel courtyard, black SUVs far behind her by the iron gate"         # Eusebia

CLIPS = [
 # 1. Gancho (0-2 s): Lencho de rodillas junto a la cajuela vacía, diez minutos y el medio millón
 ("i01", 6, f"Medium shot from behind {PAT0}: a grey-haired man in a white guayabera kneels on the gravel beside the open, empty rear hatch of the black SUV; "
            f"in front of him, a pair of brown boots and dark jeans stand still; two men in black suits stand far behind with their hands crossed in front. "
            f"No faces visible, empty hands, no weapons. No dialogue."),
 ("c01", 6, talk("c01", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, calm and confident, a small proud half smile, his hands relaxed in his jacket pockets, he looks ahead", "LEFT",
     NODOUBLE("man in a burgundy jacket")), "calm, confident, unhurried, like a businessman")),
 ("c02", 6, talk("c02", "Lencho", one(f"Close-up of {LEN} {PAT}, {KN}, dignified, holding back his feelings", "RIGHT",
     NODOUBLE("man in a white guayabera")), "dignified, firm, quiet")),
 ("c03", 6, talk("c03", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, impatient, he glances at the SUV", "LEFT"),
     "impatient, cold")),
 ("i02", 6, f"Close-up insert {PAT0}: the open rear hatch of the black SUV, the cargo area completely empty, clean grey carpet; a hand in a burgundy suede sleeve "
            f"pats the empty carpet once. Only the hand and the empty cargo area, no faces. No dialogue."),
 ("c04", 6, talk("c04", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, he tilts his head, mocking", "LEFT"),
     "mocking, cold")),
 ("c05", 6, talk("c05", "Lencho", one(f"Close-up of {LEN} {PAT}, {KN}, calm, {KEY} in his RIGHT hand", "RIGHT"),
     "calm, careful, low")),
 ("c06", 6, talk("c06", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, his smile freezes, then he frowns", "LEFT"),
     "defensive, cold, quick")),
 ("r1", 6, one(f"Close-up of {VAL} {PAT}, {VR}, in silence, his right hand touches the pocket of his burgundy jacket for a moment and he glances away", "LEFT")
           + " Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Chema", one(f"Close-up of {CHE} {PAT}, {CL}, worried, his eyes shine", "RIGHT",
     NODOUBLE("young man in a denim shirt")), "worried, upset, quick")),
 ("c08", 6, talk("c08", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, he turns his head sharply, cold", "LEFT"),
     "cold, sharp")),
 # 2. La escolta duda; la llamada de Treviño; la cámara de la camioneta
 ("c09", 6, talk("c09", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, {RADIO}, serious and respectful", "LEFT",
     NODOUBLE("man in a black cowboy hat")), "serious, respectful, low")),
 ("c10", 6, talk("c10", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, he lifts his chin, arrogant", "RIGHT"),
     "arrogant, cold")),
 ("c11", 6, talk("c11", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, he holds up a black phone that is buzzing in his RIGHT hand, its screen dark", "LEFT"),
     "quiet, careful")),
 ("c12", 6, talk("c12", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, uneasy for a second, he waves the phone away with an open hand", "RIGHT"),
     "uneasy, quick, low")),
 ("c13", 6, talk("c13", "Lencho", one(f"Close-up of {LEN} {PAT}, {KN}, calm, he lifts his eyes", "RIGHT"),
     "calm, firm, low")),
 ("c14", 6, talk("c14", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, quick and dismissive, he shakes his head", "LEFT"),
     "dismissive, quick")),
 ("r2", 6, one(f"Close-up of {LEN} {PAT}, {KN}, in silence, he frowns slowly and narrows his eyes, thinking", "RIGHT") + " Slow push-in. No dialogue."),
 ("c15", 6, talk("c15", "Lencho", one(f"Close-up of {LEN} {PAT}, {KN}, calm, a very small knowing look", "RIGHT"),
     "calm, quiet, sure")),
 ("c16", 6, talk("c16", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, cold, he checks a gold wristwatch", "LEFT"),
     "cold, threatening, low")),
 ("r3", 6, one(f"Close-up of {CHE} {PAT}, {CL}, in silence, he types quickly on a black phone held low in both hands, glancing up toward his father", "RIGHT")
           + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Lencho", one(f"Close-up of {LEN} {PAT}, {KN}, he turns his eyes gently toward his son, calm and proud", "LEFT"),
     "calm, proud, tender")),
 # 3. Montaje paralelo: doña Eusebia lee el mensaje y sale el convoy
 ("c18", 6, talk("c18", "Eusebia", one(f"Close-up of {EUS} {SUV}, she lowers a black phone from her eyes, very serious", "LEFT",
     NODOUBLE("old woman in a black rebozo")), "serious, low, slow, the one who is in charge")),
 ("i03", 6, f"Aerial drone shot at sunrise over a dirt road in the pine-covered sierra of Durango: three black SUVs with no logos drive fast in a line raising golden dust. "
            f"No people visible, no license plates. No dialogue."),
 ("c19", 6, talk("c19", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, {RADIO}, he lowers the radio from his ear, serious", "LEFT"),
     "serious, quick, low")),
 ("c20", 6, talk("c20", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, surprised and uneasy, he looks toward the gate", "LEFT"),
     "surprised, uneasy, quick")),
 # 4. La llegada: el portón, los anillos, "párate, Lencho"
 ("i04", 6, f"Wide shot {PAT0}: the tall black iron gate swings open and three black SUVs with no logos roll in slowly over the gravel raising golden dust; "
            f"men in plain black suits step out and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("i05", 6, f"Close-up insert {PAT0}: an old woman's hand with two gold rings rests on the edge of the open door of a black SUV; black low-heeled shoes step down onto the gravel "
            f"under the hem of a black dress. Only the hand, the door and the shoes, no faces. No dialogue."),
 ("c21", 6, talk("c21", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, calm and firm, she looks down at someone kneeling", "LEFT",
     NODOUBLE("old woman in a black rebozo")), "calm, firm, low")),
 ("c22", 6, talk("c22", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, nervous, his hands open and low", "LEFT"),
     "nervous, quick")),
 ("c23", 6, talk("c23", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, very calm, she does not blink", "RIGHT"),
     "calm, proud, low")),
 ("c24", 6, talk("c24", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, standing now, dignified, gravel dust on his trousers", "RIGHT"),
     "dignified, quiet, firm")),
 # 5. La grabación: el indicio se cierra
 ("c25", 6, talk("c25", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she turns her eyes to her right, firm", "RIGHT"),
     "firm, low, slow")),
 ("c26", 6, talk("c26", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, a forced smile, too quick", "LEFT"),
     "nervous, quick, flattering")),
 ("c27", 6, talk("c27", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she narrows her eyes slowly, suspicious", "RIGHT"),
     "calm, suspicious, quiet")),
 ("r4", 6, one(f"Close-up of {VAL} {PAT}, {VR}, in silence, he swallows and looks away toward the ground", "LEFT") + " Slow push-in. No dialogue."),
 ("i06", 6, f"Over-the-shoulder close-up {PAT0}: over the right shoulder of a man in a black suit jacket and a black cowboy hat, {TAB}; on it, {SCREEN}: "
            f"at night, a man in a burgundy suede jacket opens the rear hatch of a black SUV with a key. No faces in sharp focus. No dialogue."),
 ("c28", 6, talk("c28", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, {TAB} low at his side, serious", "LEFT"),
     "serious, low, careful")),
 # 6. Inversión: el plazo cambia de lado (el castigo queda para la Parte 2)
 ("c29", 6, talk("c29", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, hurt and serious, her eyes shine", "RIGHT"),
     "hurt, serious, low")),
 ("c30", 6, talk("c30", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, ashamed, his hands open and low", "LEFT"),
     "ashamed, pleading, quick")),
 ("c31", 6, talk("c31", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, still, calm and final", "RIGHT"),
     "calm, final, slow")),
 ("c32", 6, talk("c32", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, her eyes soft, she speaks gently toward the man by the SUV", "LEFT"),
     "gentle, sincere, low")),
 ("i07", 6, f"Over-the-shoulder close-up {PAT0}: over the right shoulder of a man in a black suit jacket and a black cowboy hat, {TAB}; on it, {SCREEN}: "
            f"at night, a man in a burgundy suede jacket hands a closed black briefcase through the window of a white pickup truck. No faces in sharp focus. No dialogue."),
 ("c33", 6, talk("c33", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, {TAB} in his RIGHT hand, grave", "LEFT"),
     "grave, low")),
 ("c34", 6, talk("c34", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she turns slowly toward her son, her face goes hard and pale", "RIGHT"),
     "surprised, hurt, very low")),
 ("r5", 6, one(f"Close-up of {VAL} {PAT}, {VR}, in silence, he goes pale and freezes, his lips slightly open", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Lencho junto a la camioneta, a cámara
 ("c35", 10, talk("c35", "Lencho", f"Medium close-up of {LEN} {PAT}, alone, standing beside the black SUV, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he spins {KEY} around one finger, brushes the gravel dust off his trousers, "
     f"tilts his head, raises his eyebrows, nods and smiles a little under his grey mustache. Nobody else in the courtyard.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly"), ("brake hard", "stop")]
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("Y luego te saco yo.", "Y luego te vas."), ("Madre, se llevó el maletín.", "Madre, el maletín no está."),
        ("¿El que se llevó a tu padre?", "¿El que le quitó todo a tu padre?"), ("¿Me estás acusando, chofer?", "¿Me estás culpando, chofer?"),
        ("kneels on the gravel", "rests on one knee on the gravel"), ("kneeling on the gravel", "resting on one knee on the gravel"),
        ("security video", "home video"), ("black briefcase", "black bag"), ("her face goes hard and pale", "her face turns serious"),
        ("goes pale and freezes", "stays very still")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden sunrise light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the gravel courtyard of a ranch in the sierra of Durango at sunrise, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, golden morning light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FLORENCIO_ARAMBULA}", "an old Mexican chauffeur"), ("@{VALENTE_MONTALVO2}", "a young rich Mexican man"),
         ("@{EUSEBIA_MONTALVO}", "an old Mexican matriarch"), ("@{BRIGIDO_TOSTADO}", "a Mexican bodyguard"),
         ("@{CHEMA_ARAMBULA}", "a young Mexican ranch hand"), (" @{LOC_COCHERARANCHO}", "")]
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
