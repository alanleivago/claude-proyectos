"""Genera los clips de garrafon-bernal PARTE 1 (Los Garrafones de Bernal, remake transformado de "Su esposa les prohibió el agua a los empleados" de @atriumstories_, viñedo de Bernal, Querétaro, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de aserrin-huamantla (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Gancho 0-2 s: las manos de Jovita sacando agua gris de la tina de lavar cajas, con los garrafones encadenados detrás (i01), y Leoncio con el plazo: "¡Jovita, deja esa tina! Antes de que se meta el sol me explicas esto."
# Plazo: la puesta de sol del jueves de entrega; vuelve al final como promesa: "Antes de que se meta el sol… voy a saber a dónde va esa camioneta." (c28).
# Capas del misterio (ritmo del original, otros detalles): agua con cadena y candado (c04, i02) -> una sola comida a las cuatro (c09-c10) -> miedo a que los corran (c13)
# -> en la cocina, doña Petronila: órdenes de Lorena (c19-c20) -> la mitad del mandado se va en la camioneta blanca por el portón de atrás y vuelve vacía (c22-c25, i04, i05). Lorena (la esposa, villana) no sale: solo se nombra.
# Geografía fija. Patio del viñedo (tarde dorada): Jovita a la IZQUIERDA junto a la tina galvanizada; Leoncio a la DERECHA junto a la banca de piedra con los garrafones encadenados.
# Cocina: Petronila a la IZQUIERDA junto a la estufa; Leoncio a la DERECHA junto a la puerta. Plano de presentación: Leoncio c01, Jovita c02, Petronila c16. CTA (c29): Leoncio solo en el patio, a cámara. Sin Navidad.
PAT0 = ("in the dusty work yard of a small family vineyard near Bernal, Querétaro @{LOC_PATIOBERNAL} in warm late-afternoon golden light: packed earth ground, stacks of wooden grape crates, "
        "a big round galvanized tub of grey rinse water on the LEFT, a low stone bench on the RIGHT with four blue plastic water jugs tied together with a heavy chain and a padlock, "
        "green rows of grapevines behind, the huge rock monolith of the Peña de Bernal on the horizon; no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
KIT0 = ("in the big rustic kitchen of the vineyard house near Bernal, Querétaro @{LOC_COCINABERNAL} in warm afternoon light from a window: walls with blue-and-white tiles, a gas stove with clay pots on the LEFT, "
        "tall wooden pantry shelves that are half empty, a wooden table in the middle, the kitchen door on the RIGHT; no readable text, no signs, no logos")
KIT = KIT0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Leoncio barba blanca corta y chaleco de gamuza café; solo Jovita paliacate rojo y camisa verde olivo; solo Petronila chongo gris, lentes con cordón y mandil de cuadros rojos.
LEO = ("@{LEONCIO_AVALOS} (57-year-old Mexican man, light-brown skin, tall and slim, silver hair combed back, a short neatly trimmed white beard, no hat, no glasses, "
       "a beige linen long-sleeve shirt under a dark brown suede vest, dark jeans, a silver wristwatch on his left wrist, his hands kept low)")
JOV = ("@{JOVITA_RESENDIZ} (26-year-old adult Mexican woman, brown skin, slim, black hair in a low ponytail under a red bandana tied on her head, no makeup, "
       "an olive-green long-sleeve cotton work shirt, faded jeans, a wide straw hat hanging on her back by its cord)")
PET = ("@{PETRONILA_OCADIZ} (64-year-old Mexican woman, brown skin, short and sturdy, grey hair in a tight bun, thin gold reading glasses hanging on a beaded cord around her neck, "
       "a navy-blue cardigan over a white blouse, a red-and-white checkered apron)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
JUGS = "four blue plastic water jugs tied together with a heavy steel chain and a closed padlock on a low stone bench"
TUB = "a big round galvanized tub of grey rinse water with floating grape leaves"
TRUCK = "a plain white pickup truck with cardboard grocery boxes in the open back, no letters, no logos"
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

LR = "standing on the RIGHT of the yard beside the low stone bench with the chained blue water jugs"       # Leoncio (patio)
JL = "crouching on the LEFT beside the galvanized tub of grey rinse water"                                # Jovita (c02)
JLS = "standing on the LEFT beside the galvanized tub and the stacked wooden grape crates"               # Jovita (desde c03)
PL = "standing on the LEFT beside the gas stove with the clay pots"                                        # Petronila
LK = "standing on the RIGHT just inside the kitchen door"                                                   # Leoncio (cocina)

CLIPS = [
 # 1. Gancho (0-2 s): agua de la tina con los garrafones encadenados detrás; Leoncio con el plazo de la puesta de sol
 ("i01", 6, f"Close-up insert {PAT0}: two slim brown hands cup grey water from {TUB} and lift it toward the mouth; in the soft-focus background {JUGS}. "
            f"Only the hands, the tub and the chained jugs, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Leoncio", f"Medium shot of {LEO} {PAT}, {LR}, he has just stopped in his tracks, shocked and serious, he raises one open hand, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a suede vest')}.", "firm, loud, shocked")),
 ("c02", 6, talk("c02", "Jovita", f"Medium shot of {JOV} {PAT}, {JL}, she drops the water from her hands and looks up, embarrassed, her eyes shine, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a red bandana')}.", "embarrassed, quiet, sincere")),
 ("c03", 6, talk("c03", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, he gestures with his head toward the stone bench beside him, puzzled", "LEFT"),
     "puzzled, firm")),
 ("c04", 6, talk("c04", "Jovita", one(f"Close-up of {JOV} {PAT}, {JLS}, she lowers her voice and glances toward the bench on the right", "RIGHT"),
     "quiet, nervous, honest")),
 ("i02", 6, f"Close-up insert {PAT0}: {JUGS}; the padlock shines in the golden light, a little dust on the chain. Only the jugs, the chain and the padlock, no people, no letters. No dialogue."),
 ("c05", 6, talk("c05", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, his eyes go wide, disbelief", "LEFT"),
     "disbelieving, indignant")),
 ("c06", 6, talk("c06", "Jovita", one(f"Close-up of {JOV} {PAT}, {JLS}, she holds the cord of her straw hat with both hands, ashamed", "RIGHT"),
     "quiet, ashamed")),
 ("c07", 6, talk("c07", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, he shakes his head slowly, his jaw tight", "LEFT"),
     "firm, hurt, low")),
 ("c08", 6, talk("c08", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, he narrows his eyes, thinking, then asks", "LEFT"),
     "suspicious, calm")),
 ("c09", 6, talk("c09", "Jovita", one(f"Close-up of {JOV} {PAT}, {JLS}, the slim young woman with the red bandana is the one who speaks, her eyes shine; no man in the frame", "RIGHT",
     NODOUBLE("woman with a red bandana")), "sad, quiet, honest")),
 ("c10", 6, talk("c10", "Jovita", one(f"Close-up of {JOV} {PAT}, {JLS}, she presses one hand on her stomach for a second", "RIGHT"),
     "sad, quiet, a little shaky")),
 ("c11", 6, talk("c11", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, he looks away toward the house, angry and confused", "LEFT"),
     "angry, confused, firm")),
 ("c12", 6, talk("c12", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, softer now, he looks back at the young woman", "LEFT"),
     "hurt, soft, low")),
 ("c13", 6, talk("c13", "Jovita", one(f"Close-up of {JOV} {PAT}, {JLS}, she glances toward the house behind her, afraid", "RIGHT"),
     "afraid, very quiet")),
 ("r1", 6, one(f"Close-up of {JOV} {PAT}, {JLS}, in silence, she lowers her eyes and wipes her wet hands on her jeans, ashamed", "RIGHT") + " Slow push-in. No dialogue."),
 ("c14", 6, talk("c14", "Leoncio", one(f"Close-up of {LEO} {PAT}, {LR}, warm and protective, he nods once with a gentle look", "LEFT"),
     "warm, protective, firm")),
 # 2. El tiempo corre: el sol baja sobre la Peña de Bernal
 ("i03", 6, f"Wide shot of the rows of a vineyard near Bernal, Querétaro, in late-afternoon golden light, the sun low over the huge rock monolith of the Peña de Bernal, "
            f"long shadows between the grapevines, a white stone farmhouse at the end of the rows. No people, no letters, no signs. No dialogue."),
 # 3. La cocina: doña Petronila
 ("c15", 6, talk("c15", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, serious, he looks across the kitchen", "LEFT"),
     "serious, firm, controlled")),
 ("c16", 6, talk("c16", "Petronila", f"Medium shot of {PET} {KIT}, {PL}, she holds a wooden spoon in her RIGHT hand and wrings her apron with the other, worried, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a checkered apron')}.", "worried, humble, quiet")),
 ("c17", 6, talk("c17", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, kind and respectful, he softens his face", "LEFT"),
     "kind, reassuring, low")),
 ("c18", 6, talk("c18", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, firm again, he waits for the answer", "LEFT"),
     "firm, serious")),
 ("c19", 6, talk("c19", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she sighs and looks down at the clay pots", "RIGHT"),
     "sad, honest, quiet")),
 ("c20", 6, talk("c20", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she touches the glasses hanging on her chest, ashamed", "RIGHT"),
     "ashamed, quiet")),
 ("r2", 6, one(f"Close-up of {LEO} {KIT}, {LK}, in silence, he looks at the half-empty pantry shelves, his jaw tight, breathing slowly", "LEFT") + " Slow push-in. No dialogue."),
 ("c21", 6, talk("c21", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, confused, he spreads one hand", "LEFT"),
     "confused, firm")),
 ("c22", 6, talk("c22", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she leans closer and lowers her voice", "RIGHT"),
     "secret, quiet")),
 ("i04", 6, f"Close-up insert {KIT0}: tall wooden pantry shelves that are half empty, only a few bags of beans and rice and a couple of cans, dust where boxes used to be. "
            f"Only the shelves, no people, no letters, no labels. No dialogue."),
 ("c23", 6, talk("c23", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, he frowns, very serious", "LEFT"),
     "serious, quick")),
 ("c24", 6, talk("c24", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she glances toward the window, afraid of being heard", "RIGHT"),
     "very quiet, afraid")),
 ("c25", 6, talk("c25", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she shakes her head slowly", "RIGHT"),
     "quiet, worried")),
 ("r3", 6, one(f"Close-up of {LEO} {KIT}, {LK}, in silence, his face freezes, shocked, he slowly breathes in", "LEFT") + " Slow push-in. No dialogue."),
 ("c26", 6, talk("c26", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, he steps forward, urgent", "LEFT"),
     "urgent, worried")),
 ("c27", 6, talk("c27", "Petronila", one(f"Close-up of {PET} {KIT}, {PL}, she looks up at him with meaning", "RIGHT"),
     "quiet, meaningful")),
 ("c28", 6, talk("c28", "Leoncio", one(f"Close-up of {LEO} {KIT}, {LK}, calm and determined, he looks toward the window", "LEFT"),
     "determined, slow, final")),
 # 4. Gancho a la Parte 2: la camioneta blanca
 ("i05", 6, f"Wide shot of the back gate of a vineyard farmhouse near Bernal, Querétaro, in late-afternoon golden light: {TRUCK} parked by an open wooden gate, "
            f"the engine running with a little exhaust. No people visible, no letters, no license plate. No dialogue."),
 ("r4", 6, one(f"Close-up of {LEO} {KIT}, {LK}, in silence, he hears an engine outside and turns his head slowly toward the window, serious", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Leoncio solo en el patio, a cámara
 ("c29", 10, talk("c29", "Leoncio", f"Close-up from the chest up of {LEO} {PAT}, alone, standing in the yard, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"strokes his white beard with one hand, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "hurt"/"angry" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("¡Jovita, deja esa tina!", "Jovita, deja esa tina."), ("Y que al que no le guste, se va.", "Y que así iba a ser."),
        ("usted nos iba a correr a todos.", "usted se iba a enojar."), ("Nadie la va a correr, se lo prometo.", "Usted aquí se queda, se lo prometo."),
        ("Tranquila, Jovita, nadie te va a correr.", "Tranquila, Jovita, aquí te quedas."),
        ("cup grey water from", "touch the water of"), ("and lift it toward the mouth", ""), ("he has just stopped in his tracks, shocked and serious", "he stops, serious"),
        ("afraid of being heard", "thoughtful"), ("with a heavy steel chain and a closed padlock", "with a chain"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light at a small family vineyard near Bernal, Querétaro, grapevines and stone walls, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a vineyard farm in Querétaro in the afternoon, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft afternoon light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LEONCIO_AVALOS}", "a tall Mexican man in his late fifties with a short white beard in a beige linen shirt and a brown suede vest"),
         ("@{JOVITA_RESENDIZ}", "a slim adult Mexican woman with a red bandana on her head in an olive-green work shirt"),
         ("@{PETRONILA_OCADIZ}", "an older Mexican woman with a grey bun in a navy cardigan and a red-and-white checkered apron"),
         (" @{LOC_PATIOBERNAL}", ""), (" @{LOC_COCINABERNAL}", "")]
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
