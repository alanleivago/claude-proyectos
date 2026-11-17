"""Genera los clips de aserrin-huamantla-p2 PARTE 2 (La Alfombra de Huamantla, continuación de pieces/aserrin-huamantla, Huamantla, Tlaxcala, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de la Parte 1 (todas sus defensas: gatito en imagen, reload_flow, new_project, control de descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS en gen()).
Mismas hojas que la Parte 1 (copiadas a chars/, se resuben con make_sheets.py --reupload) + KENIA_TENOPALA. Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
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
# Gancho 0-2 s: recordatorio de la P1 (la carpeta azul en manos de Kenia, i01 <= 0.9 s) y Delfino: "Ya lo oíste, Cleotilde: la casa es de Abigail. Y la Virgen ya viene en camino." (giro + plazo de la procesión).
# Ritmo emocional de la P2 de Atrium (7705479449055169822): perdón del padre a la hija -> le quita el trabajo de las manos -> la madrastra reclama su "autoridad" -> "la estoy haciendo mujer" -> clasismo
# ("mis hijas son de otra clase") -> la echa con sus princesas -> ella se hace la víctima y amenaza -> moraleja del padre -> CTA. Detalles propios: la carpeta azul que trae Kenia confirma que las escrituras
# dicen Abigail Cuapio; Kenia se pone del lado de Abigail y le pide perdón; Cleotilde sale con su maleta por la orilla de la alfombra ("la alfombra de la Virgen no se pisa"); el colibrí lo pone Abigail.
# Geografía fija en el patio (tarde dorada, misma que la P1): Abigail a la IZQUIERDA junto a las cubetas; Cleotilde a la DERECHA (sentada en la hamaca hasta c12, de pie junto a ella desde c13);
# Kenia al fondo a la DERECHA, en la puerta de la casa bajo el corredor; Delfino al CENTRO frente al zaguán. Misma ropa que la P1. Presentación del personaje nuevo: Kenia c14 (plano medio, ropa completa). Sin Navidad.
PAT0 = ("in the inner patio of a modest family house in Huamantla, Tlaxcala @{LOC_PATIOHUAM2} in warm late-afternoon golden light: red clay floor tiles, a covered corridor with wooden beams "
        "and potted red geraniums, a woven hammock hanging under the corridor on the RIGHT, plastic buckets full of dyed sawdust in bright green, pink and yellow on the LEFT, "
        "a long wooden table with cardboard stencils, the open wooden street door at the back, the La Malinche volcano above the rooftops; no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Delfino bigote y camisa de mezclilla; solo Abigail trenza, playera mostaza y mandil azul de lunares; solo Cleotilde tubos rosas, bata fucsia y uñas rojas.
DEL = ("@{DELFINO_CUAPIO} (53-year-old Mexican man from Tlaxcala, brown skin, medium build, short black hair grey at the temples, a thick black-and-grey mustache, no beard, no hat, no glasses, "
       "a faded indigo denim work shirt with rolled sleeves and specks of colored sawdust on the sleeves, khaki trousers, his hands kept low)")
ABI = ("@{ABIGAIL_CUAPIO} (21-year-old adult Mexican woman, brown skin, slim, long black hair in one single braid, no makeup, no glasses, a mustard-yellow t-shirt under a faded blue apron "
       "with small white polka dots, her hands and forearms stained with green and pink dye)")
CLE = ("@{CLEOTILDE_TENOPALA2} (47-year-old Mexican woman, light skin, plump, dyed copper-red hair rolled in big pink hair rollers, red lipstick, big gold hoop earrings, "
       "a shiny fuchsia satin robe over a black top, gold slippers, long red nails)")
KEN = ("@{KENIA_TENOPALA} (21-year-old adult Mexican woman, light skin, slim, long straight honey-blonde hair in one high ponytail, natural makeup, small silver stud earrings, "
       "a plain lilac hoodie sweatshirt, light grey sweatpants, white sneakers)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
PHONE_C = "one phone with a gold case held in her RIGHT hand"
BRUSH = "one stiff wooden scrubbing brush held in her RIGHT hand"
STENCIL = "a large brown cardboard stencil cut in the shape of a hummingbird with open wings"
FOLDER = "a blue cardboard folder tied with a white ribbon"
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

DC = "standing in the CENTER of the patio a few steps in front of the open wooden street door"                    # Delfino
CRS = "sitting up in the woven hammock under the corridor on the RIGHT, potted red geraniums behind her"         # Cleotilde (hasta c12)
CRT = "standing under the corridor on the RIGHT next to the woven hammock, potted red geraniums behind her"      # Cleotilde (desde c13)
ALS = "standing on the LEFT beside the buckets of dyed sawdust and the long wooden table"                          # Abigail
KB = "standing at the back on the RIGHT, in the doorway of the house under the corridor, beside the woven hammock"  # Kenia

CLIPS = [
 # 1. Gancho (0-2 s): recordatorio de la Parte 1 (la carpeta azul que Kenia trae del cajón) y Delfino con el giro y el plazo
 ("i01", 6, f"Close-up insert {PAT0}: {FOLDER} held tight against a plain lilac hoodie sweatshirt by two slim hands, the person walks fast along the corridor past the woven hammock; "
            f"only the folder, the hands and the lilac sleeves, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, firm and calm, he looks toward the hammock, then glances at the street door", "RIGHT",
     NODOUBLE("man in a denim shirt")), "firm, calm, low")),
 # 2. El perdón (la escena tierna, como el arranque de la P2 de Atrium)
 ("c02", 6, talk("c02", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he turns to his daughter on his left, his eyes shine, guilty and tender", "LEFT"),
     "tender, guilty, low")),
 ("c03", 6, talk("c03", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, {BRUSH}, a small sad smile, she shakes her head gently; no man in the frame", "RIGHT",
     NODOUBLE("woman in a polka-dot apron")), "soft, kind, quiet")),
 ("c04", 6, talk("c04", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he nods slowly, then his face turns firm", "LEFT"),
     "sad, then firm")),
 ("i02", 6, f"Close-up insert {PAT0}: a man's hand in a faded indigo denim sleeve gently takes a stiff wooden scrubbing brush from a slim hand stained with green and pink dye "
            f"and sets it down on the red tiles beside a bucket of green sawdust. Only the two hands, the brush and the bucket, no faces. No dialogue."),
 ("c05", 6, talk("c05", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, gentle but firm, speaking to his daughter on his left", "LEFT"),
     "gentle, firm")),
 ("c06", 6, talk("c06", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he tips his head toward the house, a tired warm half smile", "LEFT"),
     "warm, firm, low")),
 # 3. Choque de autoridad y clasismo
 ("c07", 6, talk("c07", "Cleotilde", f"Medium shot of {CLE} {PAT}, {CRS}, {PHONE_C}, offended, she lowers the phone to her lap, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a fuchsia robe')}.", "offended, indignant")),
 ("c08", 6, talk("c08", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he turns his head sharply toward the hammock, disbelief", "RIGHT"),
     "disbelieving, sharp")),
 ("c09", 6, talk("c09", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, still facing the hammock, he lowers his voice, cold now", "RIGHT"),
     "cold, slow, hurt")),
 ("c10", 6, talk("c10", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, {PHONE_C}, she rolls her eyes and waves one hand with long red nails", "LEFT"),
     "dismissive, fake sweet")),
 ("c11", 6, talk("c11", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, one hand on his chest, hurt", "RIGHT"),
     "hurt, firm")),
 ("c12", 6, talk("c12", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, she lifts her chin and fixes one pink roller, proud", "LEFT"),
     "proud, condescending")),
 ("r1", 6, one(f"Close-up of {ABI} {PAT}, {ALS}, in silence, she lowers her eyes and looks at her own dye-stained hands, hurt", "RIGHT") + " Slow push-in. No dialogue."),
 # 4. El desenlace del giro: Kenia trae la carpeta azul y las escrituras dicen Abigail Cuapio
 ("c13", 6, talk("c13", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRT}, she has just stood up from the hammock, {PHONE_C}, sure of herself, she calls toward the house behind her", "LEFT"),
     "smug, sure, loud")),
 ("c14", 6, talk("c14", "Kenia", f"Medium shot of {KEN} {PAT}, {KB}, {FOLDER} held against her chest with both hands, uneasy, she glances at her mother on her left, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a lilac hoodie')}.", "quiet, uneasy")),
 ("i03", 6, f"Close-up insert {PAT0}: two hands with long red nails untie the white ribbon of {FOLDER} and open it; inside, a few old typed papers with a round stamp, "
            f"blurred, no readable text. Only the hands, the folder and the papers, no faces. No dialogue."),
 ("c15", 6, talk("c15", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRT}, the open blue folder in both hands, she reads, her smile disappears, shocked", "LEFT"),
     "shocked, slow, then quick")),
 ("c16", 6, talk("c16", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, very calm, he does not blink", "RIGHT"),
     "very calm, sad, low")),
 ("c17", 6, talk("c17", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, her eyes shine, she speaks softly to her father on her right", "RIGHT"),
     "tender, sad, quiet")),
 ("c18", 6, talk("c18", "Kenia", one(f"Close-up of {KEN} {PAT}, {KB}, her hands empty now, ashamed but brave, she looks at her mother on her left", "LEFT"),
     "quiet, brave, ashamed")),
 ("c19", 6, talk("c19", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRT}, she turns toward her daughter behind her, furious, the blue folder in her LEFT hand", "LEFT"),
     "furious, sharp, loud")),
 ("r2", 6, one(f"Close-up of {KEN} {PAT}, {KB}, in silence, she lowers her eyes, hurt, and crosses her arms over the lilac hoodie", "LEFT") + " Slow push-in. No dialogue."),
 # 5. El castigo: Cleotilde se va antes de la procesión
 ("c20", 6, talk("c20", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, very firm, he points his chin toward the open street door", "RIGHT"),
     "very firm, final")),
 ("c21", 6, talk("c21", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, firm and calm, slow", "RIGHT"),
     "firm, calm, slow")),
 ("c22", 6, talk("c22", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRT}, she puts one hand with red nails on her chest, playing the victim, offended", "LEFT"),
     "offended, fake hurt")),
 ("c23", 6, talk("c23", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRT}, she narrows her eyes, cold and resentful, a stiff smile", "LEFT"),
     "cold, resentful, low")),
 ("c24", 6, talk("c24", "Kenia", one(f"Close-up of {KEN} {PAT}, {KB}, her eyes shine, sincere, she looks across the patio toward the young woman on her left", "LEFT"),
     "sincere, sad, quiet")),
 ("c25", 6, talk("c25", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, a kind small smile, she nods gently", "RIGHT"),
     "kind, soft, quiet")),
 ("i04", 6, f"Insert {PAT0}: at floor level, a pair of gold slippers and a pink rolling suitcase move across the red clay tiles toward the open wooden street door; "
            f"the hem of a shiny fuchsia satin robe at the top of the frame. Only the slippers, the robe hem and the suitcase, no faces. No dialogue."),
 ("c26", 6, talk("c26", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he raises his voice toward the street door, calm and dry", "RIGHT"),
     "dry, firm, clear")),
 ("i05", 6, f"Low close-up of a cobbled street of Huamantla, Tlaxcala, in late-afternoon golden light: a pair of gold slippers and the wheels of a pink rolling suitcase pass along the very edge "
            f"of a long carpet of colored sawdust, right beside a big green and pink hummingbird design, without touching it; colonial houses in bright colors behind, soft focus. "
            f"Only the slippers, the suitcase and the carpet, no faces, no letters, no signs. No dialogue."),
 ("r3", 6, one(f"Medium close-up of {CLE} {PAT0}, standing alone in the open wooden street door at the back, a pink rolling suitcase beside her, in silence she turns her head back over her shoulder "
               f"with a resentful look, then looks away", "LEFT") + " Slow push-in. No dialogue."),
 # 6. Payoff: el colibrí de la alfombra lo pone Abigail
 ("c27", 6, talk("c27", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he turns to his daughter on his left with a warm proud smile, his eyes shine", "LEFT"),
     "warm, proud, tender")),
 ("c28", 6, talk("c28", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, surprised, then a big moved smile, her eyes shine", "RIGHT"),
     "surprised, moved, soft")),
 ("i06", 6, f"Close-up insert of a cobbled street of Huamantla at dusk, warm light: {STENCIL} lies on the stones and two slim hands stained with green and pink dye sprinkle bright pink sawdust "
            f"through it, a hummingbird shape appears; candles in glass jars along the edge. Only the hands, the stencil and the sawdust, no faces, no letters. No dialogue."),
 ("c29", 6, talk("c29", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, calm and moved, he looks at his daughter on his left, then lifts his eyes", "LEFT"),
     "calm, moved, slow")),
 # CTA con carisma (después del BLACK): Delfino solo en el patio, a cámara
 ("c30", 10, talk("c30", "Delfino", f"Tight close-up of the face and shoulders of {DEL} {PAT}, alone, standing in the patio, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a knowing half smile, makes a short pause, raises one eyebrow, "
     f"brushes colored sawdust off his denim sleeve, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "hurt"/"furious" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("¡Tú cállate, Kenia!", "Tú no te metas, Kenia."), ("Eres igual de malagradecida.", "Eres igual que ella."),
        ("Te vas a arrepentir.", "Ya lo vas a ver."), ("Y a la mía, de criada.", "Y a la mía, la pones a tallar."),
        ("En tu casa no eres la sirvienta.", "Tú no tienes por qué tallar."), ("Las tuyas y las de tus princesas.", "Las tuyas y las de tus hijas."),
        ("he turns his head sharply", "he turns his head"), ("she narrows her eyes, cold and resentful, a stiff smile", "she looks away, serious"),
        ("with a resentful look", "with a serious look"), ("walks fast", "walks"), ("playing the victim", "sighing"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"), ("fake tired, lying, sweet", "tired, sweet"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light in the inner patio of a modest house in Huamantla, Tlaxcala, red tiles and potted geraniums, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a family house in a small town of Tlaxcala in the afternoon, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft afternoon light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{DELFINO_CUAPIO}", "a Mexican man in his fifties with a black-and-grey mustache in a faded denim work shirt"),
         ("@{ABIGAIL_CUAPIO}", "a slim adult Mexican woman with one long braid in a mustard t-shirt and a blue polka-dot apron"),
         ("@{CLEOTILDE_TENOPALA2}", "a plump Mexican woman with copper-red hair in pink rollers and a fuchsia satin robe"),
         ("@{KENIA_TENOPALA}", "a slim adult Mexican woman with a honey-blonde high ponytail in a lilac hoodie"),
         (" @{LOC_PATIOHUAM2}", "")]
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
