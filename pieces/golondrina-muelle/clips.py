"""Genera los clips de golondrina-muelle PARTE 1 (La Golondrina, historia propia tipo CAPOS en un muelle de Sinaloa, Nochebuena, SIN MARCA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de chofer-patrona (todas sus defensas: gatito en imagen, control de duplicados md5). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (el pescado de don Cheyo tirado en las tablas del muelle) con figura y plazo (media hora, la lancha);
# poder SIN armas: tres lanchas blancas cruzando la bahía, hombres de camisa blanca con las manos cruzadas, radio, el anillo de la golondrina. Insertos i* sin caras y reacciones mudas r* para <=2 s por tramo.
# Indicios del giro ANTES de revelarlo: golondrina azul pintada en la proa (i02), "yo nomás la trabajo" (c04), la llamada "hoy mismo es suya" (c08, r1), Tiburcio "esa lancha no se toca" (c09),
#   el radio "vinieron por su lancha" (c13), el anillo con la misma golondrina (i05). Revelación: c23 (la lancha es de Arcadio).
# Gancho P2: la foto en el celular de Ruelas es Abelardo, el hermano de Arcadio (i07, c34). Castigo para la Parte 2.
# Nochebuena (1 de cada 3): es la mañana del 24, el pescado es para la cena; foquitos en la casita del hielo; "esta Nochebuena cenas conmigo" (c31).
# Geografía fija, todo en el muelle de madera al amanecer:
#   la lancha Golondrina amarrada a la IZQUIERDA; Cheyo al CENTRO-IZQUIERDA junto a ella; Nereida a la IZQUIERDA detrás de él; Ruelas a la DERECHA; Tiburcio a la DERECHA junto a la casita del hielo.
#   Arcadio (desde c21) al CENTRO, sus tres lanchas amarradas detrás al fondo del muelle: mira a la IZQUIERDA (Cheyo) o a la DERECHA (Ruelas/Tiburcio).
#   c18: Arcadio solo en la terraza de su casa blanca sobre la bahía (sin hoja de locación). CTA (c35): Cheyo solo junto a su lancha, a cámara.
PAT0 = ("on an old wooden fishing dock @{LOC_MUELLEPESCA} on the coast of Sinaloa at sunrise on Christmas Eve: wet weathered planks, small white fishing boats moored along it, "
        "blue fish coolers and coiled ropes, a small wooden ice house shed with a string of small Christmas lights, pelicans on the posts, calm bay, golden low light; "
        "no readable text, no signs, no logos, no boat names")
PAT = PAT0 + "; the dock behind is empty, no extras, nobody else besides the person described"
TER = ("on the terrace of a big white house high above a calm bay at sunrise, white columns, potted plants, a small Christmas wreath on the wall, the sea shining in golden light; "
       "no logos, no readable text; nobody else on the terrace")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Arcadio lleva sombrero; solo Cheyo gorra; solo Ruelas lentes y saco beige; solo Nereida mandil naranja; solo Tiburcio calvo.
CHE = ("@{ELISEO_SAUCEDA} (67-year-old Mexican fisherman, dark sun-tanned skin, thin weathered face with deep sun wrinkles, short white stubble beard, a faded navy-blue cap, no glasses, "
       "light-grey long-sleeved work shirt with rolled sleeves, white rubber boots, his hands kept low)")
RUE = ("@{HERIBERTO_RUELAS} (42-year-old Mexican man, light-brown skin, round face with a double chin, thick black mustache, square black-framed glasses, no hat, "
       "beige linen suit jacket over a light-blue shirt with no tie, a gold wristwatch, his hands kept low, he never points a finger at anyone)")
NER = ("@{NEREIDA_SAUCEDA} (26-year-old Mexican woman, clearly an adult, brown skin, oval face with freckles, long black hair in one thick braid, small gold hoop earrings, "
       "no hat, an orange rubber apron over a white t-shirt, her hands kept low)")
TIB = ("@{TIBURCIO_LERMA} (58-year-old Mexican man, tan skin, short and stocky, completely bald, short grey goatee, no hat, no glasses, navy-blue windbreaker jacket, "
       "his hands kept low)")
ARC = ("@{ARCADIO_QUINONEZ} (74-year-old Mexican man, deeply tanned skin, serene long face with deep wrinkles, thick white mustache, a wide-brimmed white straw hat, no glasses, "
       "cream linen guayabera shirt, one gold ring with a small blue swallow on his right hand)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
RADIO = "one black handheld radio held low in his RIGHT hand"
FOLDER = "one black folder held low in his LEFT hand"
PHONE = "one black phone held in his RIGHT hand"
SCREEN = ("a flat 2D contact photo of an older grey-haired Mexican man with a grey mustache displayed INSIDE the screen rectangle of the phone, nothing comes out of the screen, "
          "the image stays flat inside the screen frame, no readable text")
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

CS = "standing at the CENTER-LEFT of the dock beside the moored white-and-blue boat"   # Cheyo
NL = "standing on the LEFT of the dock behind the white-and-blue boat"                 # Nereida
RR = "standing on the RIGHT of the dock"                                             # Ruelas
TR = "standing on the RIGHT by the small wooden ice house shed"                      # Tiburcio
AC = "standing in the CENTER of the dock, three white speedboats moored far behind him at the end of the dock"   # Arcadio

CLIPS = [
 # 1. Gancho (0-2 s): el pescado tirado en las tablas, media hora y la lancha
 ("i01", 6, f"Close-up insert {PAT0}: a hand in a beige linen sleeve tips over a blue fish cooler and fresh silver fish slide across the wet planks "
            f"right up to a pair of white rubber boots that stay still. Only the hand, the fish and the boots, no faces, empty hands, no weapons. No dialogue."),
 ("c01", 6, talk("c01", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, {FOLDER}, calm and confident, a small proud half smile, he looks ahead", "LEFT",
     NODOUBLE("man in a beige linen jacket")), "calm, confident, unhurried, like an official")),
 ("c02", 6, talk("c02", "Cheyo", one(f"Close-up of {CHE} {PAT}, {CS}, dignified, holding back his feelings, he glances down at the fish on the planks", "RIGHT",
     NODOUBLE("old man in a navy-blue cap")), "dignified, firm, quiet")),
 ("c03", 6, talk("c03", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, {FOLDER}, he taps the folder once with two fingers, cold", "LEFT"),
     "cold, bureaucratic")),
 ("i02", 6, f"Close-up insert {PAT0}: the bow of the moored white-and-blue boat with a small blue swallow painted on it; beside it a hand in a beige linen sleeve "
            f"closes a padlock on a thick chain wrapped around the outboard motor. Only the hand, the chain and the boat, no faces, no letters on the boat. No dialogue."),
 ("c04", 6, talk("c04", "Cheyo", one(f"Close-up of {CHE} {PAT}, {CS}, very calm, almost serene", "RIGHT"),
     "calm, careful, low")),
 ("c05", 6, talk("c05", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, he tilts his head and laughs once, mocking", "LEFT"),
     "mocking, cold")),
 ("c06", 6, talk("c06", "Nereida", one(f"Close-up of {NER} {PAT}, {NL}, worried, her eyes shine", "RIGHT",
     NODOUBLE("young woman in an orange apron")), "worried, sincere, quick")),
 ("c07", 6, talk("c07", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, he turns his head sharply, cold", "LEFT"),
     "cold, sharp")),
 ("c08", 6, talk("c08", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, he has turned half away and talks quietly into {PHONE} pressed to his ear, a satisfied look", "RIGHT"),
     "quiet, servile, almost a whisper")),
 ("r1", 6, one(f"Close-up of {CHE} {PAT}, {CS}, in silence, he frowns slowly and narrows his eyes, he has heard something", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. Tiburcio avisa; el radio; "vinieron por su lancha"
 ("c09", 6, talk("c09", "Tiburcio", one(f"Close-up of {TIB} {PAT}, {TR}, {RADIO}, serious and respectful", "LEFT",
     NODOUBLE("bald man in a navy-blue windbreaker")), "serious, respectful, low")),
 ("c10", 6, talk("c10", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, he lifts his chin, arrogant", "RIGHT"),
     "arrogant, cold")),
 ("c11", 6, talk("c11", "Cheyo", one(f"Close-up of {CHE} {PAT}, {CS}, calm, he holds out his open hand low", "RIGHT"),
     "calm, firm, low")),
 ("c12", 6, talk("c12", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, he checks his gold wristwatch, dismissive", "LEFT"),
     "dismissive, cold")),
 ("r2", 6, one(f"Close-up of {TIB} {PAT}, {TR}, in silence, {RADIO}, he glances to his left, hesitates, then lifts the radio and holds it out toward the left", "LEFT")
           + " Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Cheyo", one(f"Close-up of {CHE} {PAT}, {CS}, {RADIO} close to his mouth, calm and quiet, he looks out at the sea", "RIGHT"),
     "calm, quiet, sure, like a radio call")),
 ("c14", 6, talk("c14", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, he laughs, amused and arrogant", "LEFT"),
     "amused, mocking")),
 ("c15", 6, talk("c15", "Nereida", one(f"Close-up of {NER} {PAT}, {NL}, confused and worried, she looks at her father", "RIGHT"),
     "confused, quiet, quick")),
 ("c16", 6, talk("c16", "Cheyo", one(f"Close-up of {CHE} {PAT}, {CS}, he turns his eyes gently toward his daughter, a very small knowing smile", "LEFT"),
     "calm, tender, sure")),
 ("r3", 6, one(f"Close-up of {NER} {PAT}, {NL}, in silence, she looks out at the sea with worry, the wind moves her braid", "RIGHT") + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, cold, he checks his gold wristwatch again", "LEFT"),
     "cold, threatening, low")),
 # 3. Montaje paralelo: don Arcadio en su terraza y las tres lanchas
 ("c18", 6, talk("c18", "Arcadio", one(f"Close-up of {ARC} {TER}, {RADIO} near his face, he lowers it slowly, very serious", "LEFT",
     NODOUBLE("old man in a white straw hat")), "serious, low, slow, the one who is in charge")),
 ("i03", 6, f"Aerial drone shot at sunrise over a calm bay on the coast of Sinaloa: three white speedboats with no logos cross the water fast in a line leaving long white wakes in golden light. "
            f"No people visible, no letters on the boats. No dialogue."),
 ("c19", 6, talk("c19", "Tiburcio", one(f"Close-up of {TIB} {PAT}, {TR}, his hands empty and low, he looks out toward the sea, serious", "LEFT"),
     "serious, quick, low")),
 ("c20", 6, talk("c20", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, surprised and uneasy, he looks out toward the sea", "LEFT"),
     "surprised, uneasy, quick")),
 # 4. La llegada: las lanchas, el anillo, "buenos días, Cheyo"
 ("i04", 6, f"Wide shot {PAT0}: three white speedboats slow down and stop at the end of the dock; men in plain white shirts tie the ropes, step onto the planks "
            f"and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("i05", 6, f"Close-up insert {PAT0}: an old tanned hand with one gold ring with a small blue swallow rests on a wooden dock post; white leather shoes step from a white boat onto the wet planks "
            f"under the hem of beige trousers. Only the hand, the post and the shoes, no faces. No dialogue."),
 ("c21", 6, talk("c21", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, calm and warm, he looks down at the fish spilled on the planks, then up", "LEFT",
     NODOUBLE("old man in a white straw hat")), "calm, warm, low")),
 ("c22", 6, talk("c22", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, {FOLDER}, nervous, a forced polite smile", "LEFT"),
     "nervous, quick, polite")),
 ("c23", 6, talk("c23", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, very calm, he does not blink", "RIGHT"),
     "calm, final, low")),
 # 5. La historia de la Golondrina (música cálida c24-c26)
 ("c24", 6, talk("c24", "Cheyo", one(f"Close-up of {CHE} {PAT}, {CS}, moved and proud, he takes off his navy-blue cap and holds it low", "RIGHT"),
     "moved, quiet, proud")),
 ("c25", 6, talk("c25", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, his eyes soft, he looks toward the old fisherman", "LEFT"),
     "warm, sincere, low")),
 ("c26", 6, talk("c26", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, he turns his eyes slowly to his left, firm again", "RIGHT"),
     "firm, slow, low")),
 # 6. Inversión: el plazo cambia de lado (el castigo queda para la Parte 2)
 ("c27", 6, talk("c27", "Ruelas", one(f"Close-up of {RUE} {PAT}, {RR}, ashamed, his hands open and low, he lowers his eyes", "LEFT"),
     "ashamed, pleading, quick")),
 ("c28", 6, talk("c28", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, he narrows his eyes slowly, suspicious", "RIGHT"),
     "calm, suspicious, quiet")),
 ("r4", 6, one(f"Close-up of {RUE} {PAT}, {RR}, in silence, he swallows and glances down at {PHONE}", "LEFT") + " Slow push-in. No dialogue."),
 ("c29", 6, talk("c29", "Tiburcio", one(f"Close-up of {TIB} {PAT}, {TR}, his hands low, serious, he glances toward the man in the linen jacket", "LEFT"),
     "serious, low, careful")),
 ("c30", 6, talk("c30", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, still, calm and final, the sea behind him", "RIGHT"),
     "calm, final, slow")),
 ("c31", 6, talk("c31", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, his eyes soft, a small warm smile under his white mustache, he speaks gently toward the old fisherman", "LEFT"),
     "gentle, sincere, warm")),
 # 7. El celular: gancho a la Parte 2
 ("i06", 6, f"Over-the-shoulder close-up {PAT0}: over the right shoulder of a man in a beige linen jacket, {PHONE} buzzing; on it, {SCREEN}. "
            f"No faces in sharp focus. No dialogue."),
 ("c32", 6, talk("c32", "Tiburcio", one(f"Close-up of {TIB} {PAT}, {TR}, his hands low, he hears a phone buzzing and looks toward it, grave", "LEFT"),
     "grave, low")),
 ("c33", 6, talk("c33", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, he holds out his open right hand low, firm", "RIGHT"),
     "firm, quiet, slow")),
 ("i07", 6, f"Over-the-shoulder close-up {PAT0}: over the right shoulder of an old man in a cream guayabera and a wide-brimmed white straw hat, {PHONE}, "
            f"the gold ring with a small blue swallow on that hand; on it, {SCREEN}. No faces in sharp focus. No dialogue."),
 ("c34", 6, talk("c34", "Arcadio", one(f"Close-up of {ARC} {PAT0}, {AC}, {PHONE} low, he lifts his eyes slowly from the phone, his face turns serious and hurt", "RIGHT"),
     "surprised, hurt, very low")),
 ("r5", 6, one(f"Close-up of {RUE} {PAT}, {RR}, in silence, he goes pale and freezes, his lips slightly open behind his glasses", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Cheyo junto a su lancha, a cámara
 ("c35", 10, talk("c35", "Cheyo", f"Medium close-up of {CHE} {PAT}, alone, standing beside the moored white-and-blue boat, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he adjusts his navy-blue cap, pats the bow of the boat, "
     f"tilts his head, raises his eyebrows, nods and smiles a little. Nobody else on the dock.",
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
        ("¡", ""), ("!", "."), ("La multa son cuarenta mil.", "Y le toca una multa."), ("Son cuarenta mil de multa.", "Y le toca una multa."),
        ("Y la lancha se va.", "Y la lancha me la llevo."), ("Esa lancha no se toca.", "Esa lancha es de respeto."),
        ("fresh silver fish slide across", "fresh silver fish spill across"), ("closes a padlock on a thick chain wrapped around", "hangs a padlock on a chain around"),
        ("speedboats", "fishing boats"), ("his face turns serious and hurt", "his face turns serious"), ("goes pale and freezes", "stays very still")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden sunrise light by the sea, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, an old wooden fishing dock on the coast of Sinaloa at sunrise, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, golden morning light by the sea, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ELISEO_SAUCEDA}", "an old Mexican fisherman"), ("@{HERIBERTO_RUELAS}", "a Mexican official in a linen jacket"),
         ("@{NEREIDA_SAUCEDA}", "a Mexican fish seller woman"), ("@{TIBURCIO_LERMA}", "a bald Mexican dock worker"),
         ("@{ARCADIO_QUINONEZ}", "an old Mexican patron in a straw hat"), (" @{LOC_MUELLEPESCA}", "")]
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
