"""Genera los clips de chofer-patrona-p2 PARTE 2 (El Chofer de la Patrona, MAJESTIC, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de chofer-patrona (todas sus defensas: gatito en imagen, recarga, proyecto nuevo, duplicados md5, TRIES=6, SOFT, NOREF). Diálogos en lines.json (fuente única).
Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda. Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4)."""
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
# Parte 2 (castigo y desenlace del giro familiar, sin armas ni sangre). Gancho 0-2 s con recordatorio: en la tableta, la chamarra vino entrega el maletín a la troca blanca (i01)
# y Eusebia: "¿A Treviño le diste mi maletín?". Desenlace familiar: Treviño engañó a Valente con un pagaré "firmado" por su papá el día que estaba internado (Lencho lo llevó);
# la troca blanca era del difunto marido. Castigos: Treviño devuelve el maletín y las llaves de la troca y se va de la sierra; Valente pide perdón y queda de chofer de Lencho.
# Payoff: el papá le pidió a Lencho que cuidara a Valente (por eso pidió la cámara y no lo acusó); la troca blanca pasa a Lencho. Cierre: "Al panteón, joven. Vamos a ver a su papá."
# Geografía fija (la de la Parte 1), mismo patio de grava frente a la casa grande, ya entrada la mañana dorada:
#   Lencho de pie al CENTRO-IZQUIERDA junto a la camioneta negra; Chema a la IZQUIERDA detrás de él; Valente a la DERECHA; Brígido a la DERECHA bajo el portal de piedra;
#   Eusebia al CENTRO: mira a la IZQUIERDA (Lencho/Chema) o a la DERECHA (Valente/Brígido/Treviño); Treviño (desde c11) a la DERECHA junto a la troca blanca, el portón detrás.
#   CTA (c34): Lencho solo, recargado en la troca blanca, a cámara.
PAT0 = ("in the gravel courtyard in front of the big house of a rich ranch @{LOC_COCHERARANCHO} in the sierra of Durango in the early morning: a long two-story house with a stone porch "
        "and wooden columns, a black SUV with its rear hatch open, a tall black iron gate far behind, pine mountains, warm golden morning light, dust in the air; "
        "no readable text, no signs, no logos, no license plates")
PAT = PAT0 + "; the courtyard behind is empty, no extras, nobody else besides the person described"
TRUCK = "an old white pickup truck with no logos and no license plates"
# Anclas de identidad y ropa (las de la Parte 1 + Treviño). Solo Brígido lleva sombrero; solo Valente chamarra vino y cadena; solo Lencho guayabera blanca; solo Chema mezclilla;
# solo Eusebia rebozo; solo Treviño lentes y traje de lino crema.
KEY = "a single car key on a red cord"
LEN = ("@{FLORENCIO_ARAMBULA} (61-year-old Mexican man, brown skin, round face with soft cheeks, thick grey mustache, short grey hair, no hat, no glasses, "
       "plain white guayabera shirt, dark grey trousers with a little gravel dust on the knees, his hands kept low)")
VAL = ("@{VALENTE_MONTALVO2} (31-year-old Mexican man, warm medium-brown skin, slightly full face with broad cheekbones, thin black mustache and light stubble, black hair combed back on top, no hat, no glasses, "
       "burgundy suede jacket over a black t-shirt, a thin gold chain, his hands kept low, he never points a finger at anyone)")
EUS = ("@{EUSEBIA_MONTALVO} (72-year-old Mexican woman, brown skin, serene oval face with fine wrinkles, silver hair in a low bun, no hat, no glasses, "
       "black dress, a black rebozo shawl over her shoulders, small pearl earrings, two gold rings on her right hand)")
BRI = ("@{BRIGIDO_TOSTADO} (48-year-old Mexican man, tan skin, tall, long face, thick black mustache with grey hairs, a black cowboy hat, no glasses, "
       "black suit jacket over a white shirt with no tie, his hands kept low)")
CHE = ("@{CHEMA_ARAMBULA} (23-year-old Mexican man, clearly an adult, brown skin, slim face, short curly black hair, clean-shaven, a small scar on his left eyebrow, "
       "no hat, no glasses, faded light-blue denim shirt with rolled sleeves, his hands kept low)")
TRE = ("@{LISANDRO_TREVINO} (66-year-old Mexican man, light olive skin, wide face with heavy jowls, balding on top with short grey hair on the sides, clean-shaven, "
       "round gold-rimmed glasses, no hat, cream linen suit over a pale blue shirt with no tie, a brown leather folder held low in his LEFT hand)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
RADIO = "one black handheld radio held low in his RIGHT hand"
TAB = "one black tablet held in his RIGHT hand"
SCREEN = ("a flat 2D grainy black-and-white night home video displayed INSIDE the screen rectangle of the tablet, nothing comes out of the screen, "
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

LS = "standing at the CENTER-LEFT beside the open rear hatch of the black SUV"                             # Lencho de pie (toda la Parte 2)
CL = "standing on the LEFT behind the black SUV"                                                          # Chema
VR = "standing on the RIGHT on the gravel"                                                                # Valente
BR = "standing on the RIGHT under the stone porch"                                                        # Brígido
EC = "standing in the CENTER of the gravel courtyard, black SUVs far behind her by the iron gate"         # Eusebia
TR = f"standing on the RIGHT beside {TRUCK}, the closed black iron gate far behind him"                   # Treviño

CLIPS = [
 # 1. Gancho con recordatorio (0-2 s): la grabación de la Parte 1 y "¿A Treviño le diste mi maletín?"
 ("i01", 6, f"Over-the-shoulder close-up {PAT0}: over the right shoulder of a man in a black suit jacket and a black cowboy hat, {TAB}; on it, {SCREEN}: "
            f"at night, a man in a burgundy suede jacket hands a closed black briefcase through the window of {TRUCK}. No faces in sharp focus. No dialogue."),
 ("c01", 6, talk("c01", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, very serious, hurt, she turns slowly toward her son", "RIGHT",
     NODOUBLE("old woman in a black rebozo")), "serious, hurt, low, the one who is in charge")),
 ("c02", 6, talk("c02", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, ashamed, his eyes down, his hands open and low", "LEFT",
     NODOUBLE("man in a burgundy jacket")), "ashamed, quick, low")),
 ("c03", 6, talk("c03", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, her eyes shine, disappointed", "RIGHT"),
     "disappointed, hurt, quiet")),
 ("c04", 6, talk("c04", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, his voice breaks a little, he looks up at his mother", "LEFT"),
     "sincere, worried, quick")),
 ("r1", 6, one(f"Close-up of {LEN} {PAT}, {LS}, in silence, he slowly shakes his head, sure of something", "RIGHT",
     NODOUBLE("man in a white guayabera")) + " Slow push-in. No dialogue."),
 # 2. El pagaré falso: Lencho sabe la verdad; Treviño viene subiendo
 ("c05", 6, talk("c05", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, calm and firm, {KEY} in his RIGHT hand", "RIGHT"),
     "calm, firm, low")),
 ("c06", 6, talk("c06", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, defensive, he frowns", "LEFT"),
     "defensive, quick")),
 ("c07", 6, talk("c07", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, dignified, his eyes shine with an old memory", "RIGHT"),
     "dignified, quiet, sure")),
 ("c08", 6, talk("c08", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, {RADIO}, he lowers the radio from his ear, alert", "LEFT",
     NODOUBLE("man in a black cowboy hat")), "serious, quick, low")),
 ("c09", 6, talk("c09", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, worried, he glances at a black phone held low in his RIGHT hand, its screen dark", "LEFT"),
     "worried, quiet, quick")),
 ("c10", 6, talk("c10", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, very calm and cold, she turns her eyes toward the porch", "RIGHT"),
     "calm, cold, slow, the one who is in charge")),
 ("i02", 6, f"Wide shot {PAT0}: the tall black iron gate swings open and {TRUCK} rolls in slowly over the gravel raising golden dust. "
            f"The driver is not visible behind the glare of the windshield. No dialogue."),
 ("i03", 6, f"Medium shot {PAT0}: behind {TRUCK}, men in plain black suits push the tall black iron gate closed and stand still in front of it in a row, "
            f"hands crossed in front of them; their hands are empty, no weapons, no faces in sharp focus. No dialogue."),
 ("i04", 6, f"Close-up insert {PAT0}: the driver door of {TRUCK} opens; brown loafers under cream linen trousers step down onto the gravel. "
            f"Only the door, the trousers and the shoes, no faces. No dialogue."),
 # 3. Treviño: el pagaré del doce de mayo, el portón cerrado, el maletín y la troca del patrón
 ("c11", 6, talk("c11", "Treviño", one(f"Close-up of {TRE} {PAT}, {TR}, a wide polite smile, too friendly", "LEFT",
     NODOUBLE("man in a cream linen suit")), "friendly, smooth, smiling, like a salesman")),
 ("c12", 6, talk("c12", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she does not smile back, very calm", "RIGHT"),
     "calm, cold, slow")),
 ("c13", 6, talk("c13", "Treviño", one(f"Close-up of {TRE} {PAT}, {TR}, he taps the brown leather folder with two fingers, confident", "LEFT"),
     "confident, smooth, polite")),
 ("c14", 6, talk("c14", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, calm, he looks straight at him", "RIGHT"),
     "calm, firm, quiet")),
 ("r2", 6, one(f"Close-up of {TRE} {PAT}, {TR}, in silence, his polite smile slowly disappears and he pushes his glasses up his nose", "LEFT") + " Slow push-in. No dialogue."),
 ("c15", 6, talk("c15", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, her eyes shine, calm and firm", "RIGHT"),
     "firm, hurt, low")),
 ("c16", 6, talk("c16", "Treviño", one(f"Close-up of {TRE} {PAT}, {TR}, a nervous small laugh, he half turns toward the white truck", "LEFT"),
     "nervous, quick, polite")),
 ("c17", 6, talk("c17", "Brígido", one(f"Close-up of {BRI} {PAT}, {BR}, {RADIO}, calm, he does not move", "LEFT"),
     "calm, firm, low")),
 ("i05", 6, f"Close-up insert {PAT0}: a hand in a cream linen sleeve sets one closed black briefcase down on the black hood of an SUV and pulls back. "
            f"Only the hand, the briefcase and the hood, no faces. No dialogue."),
 ("c18", 6, talk("c18", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she glances at the white truck, her eyes shine", "RIGHT"),
     "calm, firm, a little sad")),
 ("r3", 6, one(f"Close-up of {VAL} {PAT}, {VR}, in silence, he looks toward the white truck and his eyes shine, he recognizes it", "LEFT") + " Slow push-in. No dialogue."),
 ("c19", 6, talk("c19", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, hurt, his eyes shine, he turns to the man by the truck", "RIGHT"),
     "hurt, quiet, low")),
 ("c20", 6, talk("c20", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she holds out her open right hand with two gold rings, palm up", "RIGHT"),
     "calm, final, slow")),
 ("i06", 6, f"Close-up insert {PAT0}: a hand in a cream linen sleeve drops one ring of truck keys into an old woman's open palm with two gold rings; her fingers close around them. "
            f"Only the two hands and the keys, no faces. No dialogue."),
 ("i07", 6, f"Wide shot {PAT0}, seen from behind: a balding grey-haired man in a cream linen suit walks out alone through the small side door of the black iron gate, "
            f"his hands empty, two men in black suits stand on either side of the door with their hands crossed in front. No faces visible. No dialogue."),
 # 4. El castigo de Valente y el payoff: "su papá me pidió que lo cuidara"
 ("c21", 6, talk("c21", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she turns back to her son, serious", "RIGHT"),
     "serious, firm, low")),
 ("c22", 6, talk("c22", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, ashamed, his eyes shine, he speaks softly toward the man by the SUV", "LEFT"),
     "ashamed, sincere, very quiet")),
 ("c23", 6, talk("c23", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, a small kind look, calm", "RIGHT"),
     "calm, kind, quiet")),
 ("c24", 6, talk("c24", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, confused, his eyebrows up", "LEFT"),
     "surprised, quiet")),
 ("c25", 6, talk("c25", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, his eyes shine, a small sad smile under his grey mustache", "RIGHT"),
     "tender, sad, quiet")),
 ("r4", 6, one(f"Close-up of {VAL} {PAT}, {VR}, in silence, his eyes shine and he slowly lowers his head", "LEFT") + " Slow push-in. No dialogue."),
 ("c26", 6, talk("c26", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, calm and final, a very small smile", "RIGHT"),
     "calm, final, a little warm")),
 ("c27", 6, talk("c27", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, surprised at first, then he nods, humble", "LEFT"),
     "surprised, then humble, quiet")),
 ("c28", 6, talk("c28", "Chema", one(f"Close-up of {CHE} {PAT}, {CL}, shy, he takes half a step forward", "RIGHT",
     NODOUBLE("young man in a denim shirt")), "shy, hopeful, quick")),
 ("c29", 6, talk("c29", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, a warm smile, she turns her eyes to her left", "LEFT"),
     "warm, kind, low")),
 ("c30", 6, talk("c30", "Eusebia", one(f"Close-up of {EUS} {PAT}, {EC}, she holds up a ring of truck keys in her right hand with two gold rings, her eyes shine", "LEFT"),
     "warm, tender, low")),
 ("c31", 6, talk("c31", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, moved, his eyes shine, he holds a ring of truck keys against his chest", "RIGHT"),
     "moved, humble, quiet")),
 ("i08", 6, f"Close-up insert {PAT0}: a hand in a burgundy suede sleeve opens the rear passenger door of the black SUV and holds it open; "
            f"a grey-haired man in a white guayabera steps toward the open door. Only the hand, the door and the white guayabera from the chest down, no faces. No dialogue."),
 ("c32", 6, talk("c32", "Valente", one(f"Close-up of {VAL} {PAT}, {VR}, humble, a small honest smile, one hand on the open car door", "LEFT"),
     "humble, warm, quiet")),
 ("c33", 6, talk("c33", "Lencho", one(f"Close-up of {LEN} {PAT}, {LS}, a gentle smile, he nods slowly", "RIGHT"),
     "gentle, warm, low")),
 # CTA con carisma (después del BLACK): Lencho recargado en la troca blanca, a cámara
 ("c34", 10, talk("c34", "Lencho", f"Close-up of {LEN} {PAT}, alone, face and shoulders filling the frame, looking straight into the camera and talking to the viewer, his lips moving clearly on every word; a mischievous half smile under his grey mustache, he raises one eyebrow, makes a short pause and then asks the question, he lifts {KEY} a little next to his face. Nobody else around.",
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
        ("desperate", "worried"), ("broken", "quiet"), ("his voice breaks a little", "very quiet"), ("disappointed", "serious"),
        ("¡", ""), ("!", "."), ("Que si no pagaba, perdíamos el rancho.", "Que si no, perdíamos el rancho."), ("Treviño viene por más.", "Treviño viene para acá."),
        ("Quería la otra mitad hoy.", "Quería verme hoy."), ("Y cuando entre, lo cierran.", "Y luego lo cierran."),
        ("Su esposo me firmó un pagaré.", "Su esposo me firmó unos papeles."), ("Usted ya le quitó todo a mi marido.", "Usted ya le hizo mucho daño a mi marido."),
        ("A mi hijo no se lo lleva.", "A mi hijo no lo engaña."), ("Y no lo quiero ver en la sierra.", "Y que le vaya bien."),
        ("Lo hinqué por algo que hice yo.", "Lo culpé por algo que hice yo."), ("Tenía con qué.", "Usted podía."),
        ("Su hijo nos corrió a los dos.", "Su hijo nos quería fuera."),
        ("security video", "home video"), ("black briefcase", "black bag"), ("men in plain black suits push", "two men in plain black suits slowly push")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden morning light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the gravel courtyard of a ranch in the sierra of Durango in the morning, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, golden morning light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FLORENCIO_ARAMBULA}", "an old Mexican chauffeur"), ("@{VALENTE_MONTALVO2}", "a young rich Mexican man"),
         ("@{EUSEBIA_MONTALVO}", "an old Mexican matriarch"), ("@{BRIGIDO_TOSTADO}", "a Mexican bodyguard"),
         ("@{CHEMA_ARAMBULA}", "a young Mexican ranch hand"), ("@{LISANDRO_TREVINO}", "an old Mexican lawyer"), (" @{LOC_COCHERARANCHO}", "")]
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
    print("FIN P2", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()
