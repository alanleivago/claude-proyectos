"""Genera los clips de trajinera-xochimilco PARTE 1 (La Trajinera de Xochimilco, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos + estructura de la ref @alisorxomrb 7706249552289860896 (transformada): en el embarcadero de don Celso (68) en Xochimilco, el capataz Rubén (40) quiere desarmar para leña la
Lupita, la vieja trajinera que hizo el abuelo de Abril (25); Celso la corre con su trajinera; su abuelo Teodoro (80) cuenta que Celso siempre la quiso desde que perdió una regata;
Abril promete correr la regata de este año; remate: Celso se burla.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
# Geografía fija. Embarcadero: Abril a la IZQUIERDA en su trajinera junto al muelle; Rubén y Celso a la DERECHA en el muelle. Chinampa: Abril IZQUIERDA, Teodoro DERECHA.
YARD0 = ("on a trajinera pier in Xochimilco, Mexico City @{LOC_EMBARCADERO} in the late afternoon: a wooden dock on a green canal with colorful wooden trajinera boats with painted floral arches, "
         "tall ahuejote trees along the water, warm light; no readable text, no signs, no names painted on boats, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOME0 = ("on the small wooden dock of a humble chinampa house in Xochimilco @{LOC_CHINAMPA} at dusk: a quiet canal, vegetable beds and flowers, a lantern on a post, ahuejote trees, warm light; "
         "no readable text, no signs, no logos")
HOME = HOME0 + "; nobody else in the background, no extras, nobody besides the person described"
BOAT = "an old faded wooden trajinera boat with a peeling painted floral arch and no letters"
ABR = ("@{ABRIL_NAVARRO} (25-year-old Mexican woman, brown skin, shoulder-length wavy black hair, a white tank top under an open red flannel shirt, rolled-up jeans)")
RUB = ("@{RUBEN_ARCE} (40-year-old Mexican man, light-brown skin, shaved bald head, a black goatee, sunglasses on his head, a black polo shirt, a gold watch)")
CEL = ("@{CELSO_MONTES} (68-year-old Mexican man, heavy-set, light skin, white hair, a thick white mustache, a grey flat cap, a dark-green bomber jacket over a white shirt)")
TEO = ("@{TEODORO_NAVARRO} (80-year-old Mexican man, very thin, brown wrinkled skin, a short white beard, a worn straw hat, a loose white cotton shirt)")
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
    return f"DIALOGUE (exact Spanish words, nothing else): {who} says {said} {desc} {who} {VOICE}, {tone}. {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

# Bordes: Rubén/Celso/Teodoro le hablan a Abril -> espalda de ella LEFT; Abril les habla -> espalda RIGHT.
ABR_B = "@{ABRIL_NAVARRO} seen from behind (shoulder-length wavy black hair, open red flannel shirt)"
RUB_B = "@{RUBEN_ARCE} seen from behind (shaved bald head, black polo shirt)"
CEL_B = "@{CELSO_MONTES} seen from behind (grey flat cap, dark-green bomber jacket, heavy-set)"
TEO_B = "@{TEODORO_NAVARRO} seen from behind (worn straw hat, loose white cotton shirt, very thin)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
MUTE = "Nobody speaks, all mouths closed. No dialogue."
ONE_FROM = 3

def ots(speaker, listener, side):
    return (f"Over-the-shoulder shot from behind {listener}: the listener's blurred shoulder and the back of the head fill the {side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {speaker}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."

D8 = lambda cid: 8 if len(" ".join(L[cid]).split()) > 13 else 6

AL = f"standing on the LEFT on {BOAT} moored beside the pier, holding a paintbrush"   # Abril en su trajinera
RR = "standing on the RIGHT on the wooden pier"                                        # Rubén
CR = "standing on the RIGHT on the wooden pier, the colorful boats behind him"         # Celso
AH = f"standing on the LEFT on the small dock beside {BOAT}"                           # Abril en la chinampa
TR = "standing on the RIGHT on the small dock"                                         # Teodoro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rubén YA hablando desde el muelle, señalando con desprecio la trajinera vieja; Abril de espaldas (LEFT) pintando el arco.
 ("c01", D8("c01"), S("c01", "Rubén", f"Medium close-up of {RUB} {YARD0}, {RR}, talking from the very first frame, mocking, he points with disdain at the old faded boat", ABR_B, "LEFT", "mocking, arrogant, cold",
     f"Medium close-up of {RUB} {YARD}, {RR}, talking from the very first frame, mocking", "LEFT")),
 ("c02", D8("c02"), S("c02", "Abril", f"Close-up of {ABR} {YARD0}, {AL}, proud and firm, paint on her hands", RUB_B, "RIGHT", "proud, firm",
     f"Close-up of {ABR} {YARD}, {AL}, proud and firm", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Rubén", one(f"Close-up of {RUB} {YARD}, {RR}, a cold smile, he crosses his arms", "LEFT"), "cold, bossy")),
 ("r1", 6, f"Medium shot of {CEL} {YARD}, {CR}, already in place, he walks slowly along the pier toward the camera, annoyed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey flat cap')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Celso", one(f"Close-up of {CEL} {YARD}, {CR}, annoyed, bossy", "LEFT"), "annoyed, bossy")),
 ("c05", D8("c05"), talk("c05", "Rubén", one(f"Close-up of {RUB} {YARD}, {RR}, he turns to the boss, accusing, sly", "RIGHT"), "sly, accusing")),
 ("c06", D8("c06"), S("c06", "Celso", f"Close-up of {CEL} {YARD0}, {CR}, offended and proud, he looks down at her", ABR_B, "LEFT", "offended, proud, mocking",
     f"Close-up of {CEL} {YARD}, {CR}, offended and proud", "LEFT")),
 ("c07", D8("c07"), S("c07", "Abril", f"Close-up of {ABR} {YARD0}, {AL}, respectful but firm, her eyes shine", CEL_B, "RIGHT", "respectful, firm, emotional",
     f"Close-up of {ABR} {YARD}, {AL}, respectful but firm", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Celso", f"Close-up of {CEL} {YARD0}, {CR}, cold and final, he points down the canal", ABR_B, "LEFT", "cold, final",
     f"Close-up of {CEL} {YARD}, {CR}, cold and final", "LEFT")),
 ("r2", 6, one(f"Close-up of {ABR} {YARD}, {AL}, in silence, her eyes shine, she unties the mooring rope with dignity", "RIGHT") + " Slow push-in. No dialogue."),
 ("i01", 6, f"Wide shot of a quiet green canal in Xochimilco at dusk with ahuejote trees: {ABR} small in the frame, rowing alone with a long wooden pole on {BOAT}, moving away from the colorful pier; seen from far away, no other people, no readable text. No dialogue."),
 ("c09", 6, S("c09", "Teodoro", f"Close-up of {TEO} {HOME0}, {TR}, surprised and worried", ABR_B, "LEFT", "surprised, worried, soft",
     f"Close-up of {TEO} {HOME}, {TR}, surprised and worried", "LEFT")),
 ("c10", D8("c10"), S("c10", "Abril", f"Close-up of {ABR} {HOME0}, {AH}, sad and ashamed, her eyes shine", TEO_B, "RIGHT", "sad, low",
     f"Close-up of {ABR} {HOME}, {AH}, sad and ashamed", "RIGHT")),
 ("c11", D8("c11"), talk("c11", "Teodoro", one(f"Close-up of {TEO} {HOME}, {TR}, a slow knowing smile, a memory in his eyes", "LEFT"), "calm, knowing, slow")),
 ("c12", D8("c12"), (talk("c12", "Abril", two(f"{ABR} on the LEFT and {TEO} on the RIGHT, facing each other on the small dock beside the old boat {HOME0}, framed from the waist up; "
     f"Abril, determined, slightly closer to the camera and in sharper focus") + " " + MOUTH("Abril", "Teodoro"), "determined, brave"),
   talk("c12", "Abril", one(f"Close-up of {ABR} {HOME}, {AH}, determined", "RIGHT"), "determined, brave"))),
 ("c13", D8("c13"), talk("c13", "Teodoro", one(f"Close-up of {TEO} {HOME}, {TR}, moved, his eyes shine, a small proud smile", "LEFT"), "moved, proud, soft")),
 ("r3", 6, f"Medium shot {HOME}: {ABR} kneeling on {BOAT} at night under the lantern light, carefully repainting the faded floral arch with a small brush, focused, the only person in the shot. Slow push-in. No dialogue."),
 ("c14", 6, talk("c14", "Abril", f"Close-up of {ABR} kneeling on the old boat at night under the lantern light {HOME}, one hand on the painted arch, speaking softly to the boat, a small determined smile; "
     f"the only person in the shot; {ONE}.", "tender, soft, determined")),
 ("c15", D8("c15"), talk("c15", "Rubén", one(f"Close-up of {RUB} sitting at a small table on the pier {YARD}, gossiping, amused", "RIGHT"), "amused, gossiping")),
 ("c16", D8("c16"), talk("c16", "Celso", one(f"Close-up of {CEL} sitting at a small table on the pier {YARD}, he laughs out loud, mocking", "LEFT"), "mocking, laughing")),
 # CTA con carisma (después del BLACK): Abril sola, a cámara
 ("c17", 10, talk("c17", "Abril", f"Close-up from the chest up of {ABR} {HOME}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, pushes her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small brave half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Mañana la mando a desarmar para leña.", "Mañana la mando quitar de aquí."), ("Don Celso dijo que la Lupita es pura leña.", "Don Celso dijo que la Lupita ya no sirve."),
        ("Esa tabla vieja se hunde antes de la primera curva.", "Esa trajinera vieja no llega ni a la primera curva."), ("offended", "surprised"),
        ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("stunned", "surprised"), ("his face darkens slowly", "thoughtful"),
        ("resentful", "serious"), ("powerful", "serious"), ("three black pickup trucks", "three dark pickup trucks"), ("pushes", "moves"),
        ("hurt and angry", "serious"), ("secretive", "thoughtful"), ("cruel", "cold"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("defiant", "confident"), ("bossy", "firm"), ("lazy", "relaxed"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light on a trajinera pier in Xochimilco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colorful wooden boats on a green canal with ahuejote trees in Mexico City, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ABRIL_NAVARRO}", "a Mexican woman in her twenties with shoulder-length wavy black hair, a white tank top and an open red flannel shirt"),
         ("@{RUBEN_ARCE}", "a bald Mexican man around forty with a black goatee, sunglasses on his head and a black polo shirt"),
         ("@{CELSO_MONTES}", "a heavy-set elderly Mexican man with a white mustache, a grey flat cap and a dark-green bomber jacket"),
         ("@{TEODORO_NAVARRO}", "a very thin elderly Mexican man with a short white beard, a worn straw hat and a white cotton shirt"),
         (" @{LOC_EMBARCADERO}", ""), (" @{LOC_CHINAMPA}", "")]
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
    low = (r.stdout + r.stderr).lower()
    if any(w in low for w in ("crédito", "credito", "credit", "quota", "cuota", "insufficient", "suficientes", "saldo")) and not any(l.endswith(".mp4") for l in r.stdout.splitlines()):
        print("SIN CREDITOS:", (r.stdout + r.stderr).strip()[-400:].replace(chr(10), " "), flush=True); sys.exit("FIN por SIN CREDITOS")
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
    force_one = "--one" in sys.argv
    want = set(a for a in sys.argv[1:] if a != "--one")
    OUT.mkdir(exist_ok=True)
    if want: reload_flow(); time.sleep(5)  # regens tras --reupload: el selector de assets queda abierto y el @ no abre el picker
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
            alt = isinstance(body, tuple)
            use_one = alt and (force_one or k >= ONE_FROM)
            files, log = gen(variant((body[1] if use_one else body[0]) if alt else body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1}{', single' if use_one else ''})", flush=True); break
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
