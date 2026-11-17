"""Genera los clips de aserrin-huamantla PARTE 1 (La Alfombra de Huamantla, remake transformado de "Llegó a casa y vio lo que su esposa le hacía a su hija" de @atriumstories_, Huamantla, Tlaxcala, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de plata-taxco (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Gancho 0-2 s: las manos teñidas de Abigail tallando el piso (i01) y Delfino con la figura y el plazo: "Antes de que pase la Virgen, Cleotilde… me vas a explicar esto."
# Plazo: la procesión de esta noche (La noche que nadie duerme); la alfombra de aserrín a medio hacer en la calle (i03). Inversión: "Cuando la Virgen pase por la calle… tú y tus hijas ya no estarán aquí." (c28).
# La mentira (como "yo hice la comida" del original, con otros detalles): Cleotilde dice que ELLA tiñó el aserrín de la alfombra (c08); Abigail la desmiente: el aserrín y la plantilla del colibrí son suyos (c09-c10).
# Giro: la casa es de Abigail, escriturada por su madre (c24-c25). Gancho P2: Cleotilde le pide a Kenia la carpeta azul con las escrituras (c29, i04, c30). Las hijas de Cleotilde (Kenia y Dayana, adultas) solo se nombran.
# Geografía fija en el patio (tarde dorada): Abigail a la IZQUIERDA junto a las cubetas de aserrín teñido; Cleotilde a la DERECHA en la hamaca bajo el corredor; Delfino al CENTRO frente al zaguán abierto del fondo.
# Un plano de presentación por personaje (plano medio con la ropa completa): Delfino c01, Cleotilde c02, Abigail r1. CTA (c31): Delfino solo en el patio, a cámara. Sin Navidad.
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
CR = "lying back in a woven hammock under the corridor on the RIGHT, potted red geraniums behind her"            # Cleotilde (hasta c14)
CRS = "sitting up in the woven hammock under the corridor on the RIGHT, potted red geraniums behind her"         # Cleotilde (desde c15)
AL = "kneeling on the red tiles on the LEFT beside the buckets of dyed sawdust"                                    # Abigail (r1)
ALS = "standing on the LEFT beside the buckets of dyed sawdust and the long wooden table"                          # Abigail (desde c09)

CLIPS = [
 # 1. Gancho (0-2 s): las manos teñidas tallando el piso; Delfino con el plazo de la procesión
 ("i01", 6, f"Close-up insert {PAT0}: two slim hands stained with green and pink dye scrub the red clay tiles hard with a stiff wooden brush, soapy water around them, "
            f"a bucket of bright green dyed sawdust beside them; in the soft-focus background a gold slipper dangles from a woven hammock. Only the hands, the brush, the bucket and the tiles, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Delfino", f"Medium shot of {DEL} {PAT}, {DC}, he has just stopped in his tracks, serious and hurt, his eyes go from the floor to the hammock, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a denim shirt')}.", "firm, hurt, low, controlled")),
 ("c02", 6, talk("c02", "Cleotilde", f"Medium shot of {CLE} {PAT}, {CR}, she slowly blows on her freshly painted red nails, {PHONE_C}, a fake sweet smile, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a fuchsia robe')}.", "fake sweet, lazy, a little annoyed")),
 ("c03", 6, talk("c03", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he glances toward the floor on his left, then back, jaw tight", "RIGHT"),
     "serious, low, firm")),
 ("c04", 6, talk("c04", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CR}, she waves one hand with red nails, dismissive", "LEFT"),
     "dismissive, proud")),
 ("c05", 6, talk("c05", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he takes one step forward, his voice rising a little", "RIGHT"),
     "indignant, firm")),
 ("c06", 6, talk("c06", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CR}, she raises her eyebrows and looks at her nails, cold", "LEFT"),
     "cold, condescending")),
 ("r1", 6, f"Medium shot of {ABI} {PAT}, {AL}, {BRUSH}, in silence she lowers her eyes and keeps scrubbing the tiles slowly, ashamed, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he looks at the woman in the hammock with disbelief", "RIGHT"),
     "disbelieving, sharp")),
 ("c08", 6, talk("c08", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CR}, she puts one hand on her chest, playing the victim, a fake tired sigh", "LEFT"),
     "fake tired, lying, sweet")),
 ("i02", 6, f"Close-up insert {PAT0}: on the long wooden table, {STENCIL} lies next to three plastic buckets of freshly dyed sawdust in bright green, pink and yellow; "
            f"warm golden light. Only the stencil, the buckets and the table, no people, no letters. No dialogue."),
 ("c09", 6, talk("c09", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, the slim young woman with the braid and the polka-dot apron is the one who speaks, she lifts her eyes, scared but brave; no man in the frame", "RIGHT",
     NODOUBLE("woman in a polka-dot apron")), "scared but brave, quiet")),
 ("c10", 6, talk("c10", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, she shows her dye-stained hands for a second, her voice shaking a little", "RIGHT"),
     "quiet, sincere, a little shaky")),
 ("c11", 6, talk("c11", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, his eyes soften as he turns to his daughter on his left", "LEFT"),
     "surprised, soft, low")),
 ("c12", 6, talk("c12", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, she glances quickly toward the hammock, then down", "RIGHT"),
     "very quiet, hurt")),
 ("c13", 6, talk("c13", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, moved, his eyes shine, he speaks gently to his daughter", "LEFT"),
     "tender, sad, low")),
 ("c14", 6, talk("c14", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, her eyes shine, she bites her lip", "RIGHT"),
     "tender, sad, quiet")),
 # 2. Escalada: Cleotilde le grita a Abigail y Delfino la defiende
 ("c15", 6, talk("c15", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, she sits up fast in the hammock, {PHONE_C}, furious, she glares to her side", "LEFT"),
     "furious, sharp, loud")),
 ("c16", 6, talk("c16", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he turns his head sharply toward the hammock, very firm", "RIGHT"),
     "very firm, loud, protective")),
 ("c17", 6, talk("c17", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, still firm, he lowers his voice, cold now", "RIGHT"),
     "cold, firm, slow")),
 ("c18", 6, talk("c18", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, offended, she adjusts the collar of her fuchsia robe", "LEFT"),
     "offended, indignant")),
 ("c19", 6, talk("c19", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he shakes his head slowly", "RIGHT"),
     "firm, sad, low")),
 ("c20", 6, talk("c20", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, she lifts her chin, proud and offended", "LEFT"),
     "proud, offended")),
 ("r2", 6, one(f"Close-up of {DEL} {PAT}, {DC}, in silence, he looks down at the cardboard stencil on the table, his jaw tight, breathing slowly", "LEFT") + " Slow push-in. No dialogue."),
 ("c21", 6, talk("c21", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, a bitter half smile, ironic", "RIGHT"),
     "ironic, bitter, slow")),
 ("c22", 6, talk("c22", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, she closes her eyes for a second with a superior smile", "LEFT"),
     "condescending, sweet, cold")),
 # 3. El tiempo corre: la alfombra de la calle a medio hacer
 ("i03", 6, f"Wide shot of a cobbled street of Huamantla, Tlaxcala, in late-afternoon golden light: a long carpet of colored sawdust half finished along the street, "
            f"a big green and pink hummingbird design on the stones, colonial houses painted in bright colors on both sides, the La Malinche volcano at the end of the street. "
            f"No people, no letters, no signs. No dialogue."),
 # 4. Giro: la casa es de Abigail
 ("c23", 6, talk("c23", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, {PHONE_C}, a smug smile, sure of herself", "LEFT"),
     "smug, sure")),
 ("c24", 6, talk("c24", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, very calm, he does not blink", "RIGHT"),
     "very calm, quiet, firm")),
 ("c25", 6, talk("c25", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, he glances with tenderness at his daughter on his left, then back", "RIGHT"),
     "calm, sad, low")),
 ("c26", 6, talk("c26", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, her smile disappears, shocked, she leans forward", "LEFT"),
     "shocked, quick")),
 ("r3", 6, one(f"Close-up of {CLE} {PAT}, {CRS}, in silence, she slowly lowers the phone and looks toward the young woman on the left with cold narrowed eyes", "LEFT") + " Slow push-in. No dialogue."),
 ("c27", 6, talk("c27", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, sad and honest", "RIGHT"),
     "honest, sad, low")),
 ("c28", 6, talk("c28", "Delfino", one(f"Close-up of {DEL} {PAT}, {DC}, firm and calm, he tips his chin toward the open street door", "RIGHT"),
     "firm, final, slow")),
 # 5. Gancho a la Parte 2: la carpeta azul
 ("c29", 6, talk("c29", "Cleotilde", one(f"Close-up of {CLE} {PAT}, {CRS}, she turns her face away and holds the gold phone to her ear with her RIGHT hand, whispering fast", "LEFT"),
     "whispering, quick, sly")),
 ("i04", 6, f"Close-up insert inside a dim bedroom of a modest house in Huamantla, Tlaxcala: {FOLDER} lies inside a half-open wooden dresser drawer, warm light from the window. "
            f"Only the drawer and the folder, no people, no letters. No dialogue."),
 ("c30", 6, talk("c30", "Abigail", one(f"Close-up of {ABI} {PAT}, {ALS}, alarmed, she turns quickly toward her father on her right", "RIGHT"),
     "alarmed, quick, low")),
 ("r4", 6, one(f"Close-up of {DEL} {PAT}, {DC}, in silence, his face turns serious and he turns his head slowly toward the door of the house", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Delfino solo en el patio, a cámara
 ("c31", 10, talk("c31", "Delfino", f"Tight close-up of the face and shoulders of {DEL} {PAT}, alone, standing in the patio, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a mischievous grin, makes a short pause, raises one eyebrow, "
     f"rubs his mustache with one finger, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "hurt"/"furious" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("¡Cállate, mentirosa!", "Ya, Abigail, no inventes."), ("Deja de meterle cosas a tu padre.", "No le cuentes cosas a tu padre."),
        ("Malagradecido, yo te la eduqué.", "Ay, Delfino, yo te la eduqué."), ("La tienes de sirvienta.", "La tienes haciendo todo."),
        ("y la mía es tu sirvienta.", "y la mía hace todo."), ("A Abigail no la tocas.", "Con Abigail no te metes."),
        ("scrub the red clay tiles hard", "clean the red clay tiles"), ("she sits up fast in the hammock", "she sits up in the hammock"),
        ("he turns his head sharply", "he turns his head"), (" with cold narrowed eyes", ""), ("whispering fast", "speaking very low"),
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
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()
