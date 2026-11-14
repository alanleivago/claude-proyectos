"""Genera los clips de cincha-cortada PARTE 1 (La Cincha Cortada, historia propia tipo CAPOS en las carreras de caballos de Sonora, MEXI) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de chofer-patrona (todas sus defensas). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (el zapato del licenciado tira la cubeta de agua frente al caballo y al viejo) con plazo y cifra (veinte minutos, tres millones);
# poder SIN armas: convoy de camionetas entre polvo, escoltas de manos cruzadas, anillo de jade, papeles comprados. Insertos i* sin caras y reacciones mudas r* para <=2 s por tramo.
# Indicios del giro (el traidor es Jacinto) ANTES de revelarlo: Jacinto quiere ensillar él (c09), Arteaga sabe lo de la cincha nueva (c10, r1), "nomás tú y yo sabíamos" (c12),
# las botas nuevas de avestruz (i03, c14), el celular que vibra y esconde (r2). Revelación: la cincha cortada (i04) y el mensaje del celular (i07, c29).
# Gancho P2: "el dinero salió de su casa" (c34-c35). El castigo de Arteaga y de Jacinto queda para la Parte 2.
# Geografía fija, todo dentro de la caballeriza del carril al atardecer:
#   Cleto al CENTRO-IZQUIERDA junto a la puerta del establo de Centella; Yahir a la IZQUIERDA; Jacinto al fondo a la DERECHA junto al burro de las sillas;
#   Arteaga a la DERECHA en el pasillo. Teodora (desde c23) al CENTRO: mira a la DERECHA (Arteaga, Jacinto) o a la IZQUIERDA (Cleto).
#   c21: Teodora sola en el asiento de atrás de su camioneta (sin hoja de locación). i05: dron sin hoja. CTA (c36): Cleto solo junto a Centella, a cámara.
PAT0 = ("inside the wooden stable of a rural horse race track @{LOC_CABALLERIZA} in Sonora in the late afternoon: a dirt aisle with scattered straw, wooden stalls, "
        "saddles on a wooden rack, a big open door at the end showing a straight dirt race track with a white wooden rail, golden low light, dust in the air; "
        "no readable text, no signs, no logos, no numbers")
PAT = PAT0 + "; the aisle behind is empty, no extras, nobody else besides the person described"
SUV = ("inside the back seat of a black SUV with tinted windows in the late afternoon, desert hills and a dirt road passing outside in golden light; no logos, no readable text; "
       "nobody else visible in the car")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Cleto lleva sombrero; solo Arteaga lentes y traje de lino crema; solo Yahir camisa amarilla de jinete;
# solo Jacinto chaleco verde olivo y botas de avestruz; solo Teodora abrigo color camello y anillo de jade.
HORSE = "@{CABALLO_CENTELLA} (a tall chestnut quarter horse with a white blaze down its face and two white socks on its front legs)"
CLE = ("@{ANACLETO_CELIS} (66-year-old Mexican man from Sonora, deeply tanned brown skin, thin face with deep wrinkles, a mole on his left cheek, short white stubble, "
       "a worn cream palm-straw cowboy hat, no glasses, faded red plaid western shirt, old jeans, his hands kept low)")
YAH = ("@{YAHIR_CELIS} (24-year-old Mexican man, clearly an adult, short and slim, brown skin, round face, thick black eyebrows, clean-shaven, black hair buzzed short, "
       "no hat, no glasses, bright yellow long-sleeved racing shirt, white riding trousers, his hands kept low)")
ART = ("@{ARTEAGA_LICENCIADO} (54-year-old Mexican man, light-brown skin, heavy-set, double chin, grey-black hair slicked back, thick black-rimmed glasses, no hat, "
       "cream linen suit with an open-collar black shirt, a thick gold bracelet on his left wrist, his hands kept low, he never points a finger at anyone)")
JAC = ("@{JACINTO_PEREDA} (36-year-old Mexican man, brown skin, narrow face, long sideburns, a thin black goatee, short black hair, no hat, no glasses, "
       "dusty grey t-shirt under an old olive-green work vest, jeans, brand-new shiny light-tan ostrich-skin cowboy boots, his hands kept low)")
TEO = ("@{TEODORA_CARRASCO} (70-year-old Mexican woman, dark brown skin, tall, strong jaw, short white hair cut at chin length, no hat, no glasses, small silver earrings, "
       "long camel-colored wool coat over a cream blouse, black trousers, a big green jade ring on her right hand)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
FLIP = "one old grey flip phone held to his ear with his RIGHT hand"
CEL = "one black smartphone"
SCREEN = ("a flat 2D chat screen with grey and green message bubbles displayed INSIDE the screen rectangle of the phone, the bubbles are blurry and unreadable, "
          "nothing comes out of the screen, the image stays flat inside the screen frame")
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

CS = "standing at the CENTER-LEFT beside the open wooden door of a horse stall"          # Cleto
YL = "standing on the LEFT of the stable aisle"                                          # Yahir
JR = "standing at the back on the RIGHT beside a wooden rack of saddles"                 # Jacinto
AR = "standing on the RIGHT in the dirt aisle of the stable"                             # Arteaga
TC = "standing in the CENTER of the dirt aisle, the big open door with golden light behind her"   # Teodora

CLIPS = [
 # 1. Gancho (0-2 s): el licenciado tira la cubeta de agua frente al caballo; veinte minutos y tres millones
 ("i01", 6, f"Low close-up {PAT0}: a polished black shoe under the hem of cream linen trousers kicks over a metal bucket of water on the dirt floor in front of a horse stall; "
            f"the water splashes and spreads over the straw toward a pair of old dusty boots and the hooves of {HORSE} behind the open stall door. "
            f"No faces visible, only shoes, boots, the bucket and the hooves. No dialogue."),
 ("c01", 6, talk("c01", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, looking down at someone, a cold arrogant smile behind his glasses", "LEFT",
     NODOUBLE("man in a cream linen suit")), "arrogant, cold, quick")),
 ("c02", 6, talk("c02", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, calm and dignified, his right hand resting on the stall door", "RIGHT",
     NODOUBLE("old man in a straw hat")), "calm, proud, low")),
 ("c03", 6, talk("c03", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, he adjusts his glasses, impatient", "LEFT"),
     "impatient, cold")),
 ("i02", 6, f"Close-up insert {PAT0}: {HORSE} inside its stall snorts and shakes its head; an old weathered hand with a sleeve of faded red plaid pats its neck slowly. "
            f"Only the horse and the hand, no faces. No dialogue."),
 ("c04", 6, talk("c04", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, he tilts his head, mocking", "LEFT"),
     "mocking, cold")),
 ("c05", 6, talk("c05", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, firm and quiet, he does not blink", "RIGHT"),
     "firm, quiet, sure")),
 ("c06", 6, talk("c06", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, he glances toward someone on his left, a cold smile", "LEFT"),
     "cold, low, insinuating")),
 ("c07", 6, talk("c07", "Yahir", one(f"Close-up of {YAH} {PAT}, {YL}, brave and offended, chin up", "RIGHT",
     NODOUBLE("young man in a yellow shirt")), "brave, firm, quick")),
 ("c08", 6, talk("c08", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, he turns his head sharply, contemptuous", "LEFT"),
     "contemptuous, cold, sharp")),
 # 2. Los indicios: Jacinto quiere ensillar, Arteaga sabe lo de la cincha, las botas, el celular
 ("c09", 6, talk("c09", "Jacinto", one(f"Close-up of {JAC} {PAT}, {JR}, too eager, a nervous smile", "LEFT",
     NODOUBLE("man in an olive-green vest")), "eager, quick, a little nervous")),
 ("c10", 6, talk("c10", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, a small knowing smile, slow", "LEFT"),
     "slow, insinuating, low")),
 ("r1", 6, one(f"Close-up of {CLE} {PAT}, {CS}, in silence, he frowns slowly and narrows his eyes under the straw hat, thinking", "RIGHT")
           + " Slow push-in. No dialogue."),
 ("c11", 6, talk("c11", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, he checks a gold wristwatch on his left wrist, then looks up, cold", "LEFT"),
     "cold, final, low")),
 ("c12", 6, talk("c12", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, he turns his eyes slowly toward the back of the stable, quiet and suspicious", "RIGHT"),
     "quiet, suspicious, low")),
 ("c13", 6, talk("c13", "Jacinto", one(f"Close-up of {JAC} {PAT}, {JR}, he shrugs and looks away, too quick", "LEFT"),
     "quick, dismissive, nervous")),
 ("i03", 6, f"Close-up insert {PAT0}: a pair of brand-new shiny light-tan ostrich-skin cowboy boots standing on dusty straw, next to old worn work boots; the legs in jeans shift weight. "
            f"Only boots and legs, no faces. No dialogue."),
 ("c14", 6, talk("c14", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, he glances down and then up, calm, a dry look", "RIGHT"),
     "calm, dry, quiet")),
 ("c15", 6, talk("c15", "Jacinto", one(f"Close-up of {JAC} {PAT}, {JR}, a forced smile, he turns toward the saddles", "LEFT"),
     "nervous, quick")),
 ("r2", 6, one(f"Close-up of {JAC} {PAT}, {JR}, in silence, {CEL} buzzes in the chest pocket of his vest, he glances at it, presses it off and hides it, then looks away", "LEFT")
           + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Yahir", one(f"Close-up of {YAH} {PAT}, {YL}, worried, he looks toward the open door and back", "RIGHT"),
     "worried, quick")),
 ("c17", 6, talk("c17", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, he turns gently toward his grandson, calm and proud", "LEFT"),
     "calm, proud, tender")),
 # 3. La cincha cortada
 ("i04", 6, f"Close-up insert {PAT0}: an old weathered hand lifts the edge of a saddle pad on the back of {HORSE}; underneath, the brown leather girth strap is cut halfway across, "
            f"a clean straight cut with frayed edges; the hand freezes. Only the hand, the leather and the horse. No dialogue."),
 ("c18", 6, talk("c18", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, very serious, he looks down at something in his hands", "RIGHT"),
     "serious, low, slow")),
 ("c19", 6, talk("c19", "Yahir", one(f"Close-up of {YAH} {PAT}, {YL}, shocked, his eyes wide", "RIGHT"),
     "shocked, quick, low")),
 ("c20", 6, talk("c20", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, {FLIP}, calm, he speaks low", "RIGHT"),
     "calm, low, respectful")),
 # 4. Montaje paralelo: doña Teodora y su convoy
 ("c21", 6, talk("c21", "Teodora", one(f"Close-up of {TEO} {SUV}, she lowers a black phone from her ear, very serious", "LEFT",
     NODOUBLE("old woman in a camel coat")), "serious, low, slow, the one who is in charge")),
 ("i05", 6, f"Aerial drone shot in the late afternoon over a dirt road in the Sonora desert: three black SUVs with no logos drive fast in a line raising golden dust toward a rural horse race track "
            f"with a white wooden rail and a wooden stable. No people visible, no license plates. No dialogue."),
 ("c22", 6, talk("c22", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, surprised and uneasy, he looks toward the open door", "LEFT"),
     "surprised, uneasy, quick")),
 ("i06", 6, f"Close-up insert {PAT0}: three black SUVs with no logos stop in the golden dust outside the open stable door; men in plain black suits stand still in a row, hands crossed in front, "
            f"hands empty, no weapons; a woman's hand with a big green jade ring pushes open a black SUV door and black low shoes step down onto the dirt. "
            f"Only the hand, the door, the shoes and the men from the chest down, no faces. No dialogue."),
 # 5. La inversión: los papeles comprados
 ("c23", 6, talk("c23", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, calm and polite, a very small smile", "RIGHT",
     NODOUBLE("old woman in a camel coat")), "calm, polite, low, the one who is in charge")),
 ("c24", 6, talk("c24", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, he lifts his chin, trying to sound confident", "LEFT"),
     "confident, a little nervous")),
 ("c25", 6, talk("c25", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, very calm, she does not blink", "RIGHT"),
     "calm, final, slow")),
 ("c26", 6, talk("c26", "Arteaga", one(f"Close-up of {ART} {PAT}, {AR}, his smile disappears, he takes off his glasses for a second", "LEFT"),
     "shaken, quick, low")),
 ("c27", 6, talk("c27", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, serious, he holds a brown leather strap low in both hands", "RIGHT"),
     "serious, low")),
 ("c28", 6, talk("c28", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, she turns her eyes to her right, firm", "RIGHT"),
     "firm, low, slow")),
 ("i07", 6, f"Over-the-shoulder close-up {PAT0}: over the right shoulder of an old woman in a camel-colored wool coat with short white hair, she holds {CEL} in her right hand with a big green jade ring; "
            f"on it, {SCREEN}. No faces in sharp focus. No dialogue."),
 ("c29", 6, talk("c29", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, she lowers {CEL} slowly and looks up, hurt and serious", "RIGHT"),
     "serious, disappointed, low")),
 ("c30", 6, talk("c30", "Jacinto", one(f"Close-up of {JAC} {PAT}, {JR}, ashamed, his hands open and low, his eyes shine", "LEFT"),
     "ashamed, pleading, quick")),
 ("c31", 6, talk("c31", "Cleto", one(f"Close-up of {CLE} {PAT}, {CS}, hurt, his eyes shine, quiet", "RIGHT"),
     "hurt, quiet, slow")),
 # 6. El plazo cambia de lado (el castigo queda para la Parte 2) y el gancho
 ("c32", 6, talk("c32", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, still, calm and cold", "RIGHT"),
     "calm, cold, slow")),
 ("c33", 6, talk("c33", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, she tilts her head slightly, a dry small smile", "RIGHT"),
     "calm, dry, final")),
 ("c34", 6, talk("c34", "Jacinto", one(f"Close-up of {JAC} {PAT}, {JR}, he swallows, then speaks low as if confessing a secret", "LEFT"),
     "low, afraid, careful")),
 ("c35", 6, talk("c35", "Teodora", one(f"Close-up of {TEO} {PAT}, {TC}, her face turns slowly serious and pale, very surprised", "RIGHT"),
     "surprised, hurt, very low")),
 ("r3", 6, one(f"Close-up of {JAC} {PAT}, {JR}, in silence, he lowers his eyes to the ground and does not answer", "LEFT") + " Slow push-in. No dialogue."),
 ("i08", 6, f"Wide shot at a rural dirt race track in Sonora in the late afternoon, golden light and dust: {HORSE} with a rider in a bright yellow racing shirt "
            f"waits at the start beside another horse, the horse stamps and the rider leans forward; a white wooden rail, a distant crowd. No readable text, no numbers. No dialogue."),
 # CTA con carisma (después del BLACK): Cleto junto a Centella, a cámara
 ("c36", 10, talk("c36", "Cleto", f"Medium close-up of {CLE} {PAT}, alone with {HORSE} beside him, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he touches and adjusts the brim of his straw hat, pats the horse's neck, "
     f"tilts his head, raises his eyebrows, nods and smiles a little. Nobody else in the stable.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly"), ("kicks over", "tips over")]
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"), ("contemptuous", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("insinuating", "calm"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("pale", "still"),
        ("¡", ""), ("!", "."), ("Aquí hablan los hombres.", "Esto es entre grandes."), ("Corriendo se iba a reventar.", "En la carrera se iba a romper."),
        ("Y me vendiste por unas botas.", "Y me cambiaste por unas botas."),
        ("is cut halfway across, a clean straight cut with frayed edges", "is torn halfway across"), ("cut halfway", "torn halfway"),
        ("splashes and spreads", "spills"), ("the hand freezes", "the hand stops")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden late afternoon light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the wooden stable of a horse race track in Sonora in the late afternoon, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, golden afternoon light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ANACLETO_CELIS}", "an old Mexican horse trainer"), ("@{YAHIR_CELIS}", "a young Mexican jockey"),
         ("@{ARTEAGA_LICENCIADO}", "a rich Mexican lawyer"), ("@{JACINTO_PEREDA}", "a Mexican stable hand"),
         ("@{TEODORA_CARRASCO}", "an old Mexican matriarch"), ("@{CABALLO_CENTELLA}", "a chestnut horse"), (" @{LOC_CABALLERIZA}", "")]
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
