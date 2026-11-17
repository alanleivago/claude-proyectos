"""Genera los clips de copita-matatlan PARTE 1 (El Catador de Matatlán, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #1 "El catador" [CAPO] (identidad oculta), cierre tipo 1 (entra un personaje inesperado): en la feria del mezcal de Santiago Matatlán, el productor de moda Iker (35) y su novia
Daniela (30) se burlan de don Teófilo (74), un viejo callado que prueba sus copitas y le dice que al mezcal le apuraron el horno. Iker presume que renta la loma de Las Ánimas "a un viejo
que ni se aparece". Llega su compradora más importante, Brígida (52), y saluda al viejo: "¡Don Teófilo!". Él: "Desde hoy, que no corten ni una piña de su lado."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
# Geografía fija (puesto): Iker y Daniela detrás del mostrador a la DERECHA; Teófilo frente al mostrador a la IZQUIERDA; Brígida llega por la IZQUIERDA.
YARD0 = ("at a mezcal fair stall in Santiago Matatlán, Oaxaca @{LOC_FERIAMATATLAN} at midday: a rustic wooden counter with clay cups and unlabeled glass bottles of mezcal, colorful papel picado "
         "without letters overhead, agave fields and dry hills beyond, bright sun; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
NIC = ("@{TEOFILO_RUIZ} (74-year-old Zapotec Mexican man, deep brown weathered skin, short white hair, a thin white mustache, a worn palm-leaf hat, a simple white cotton shirt)")
IKE = ("@{IKER_LASCURAIN} (35-year-old Mexican man, light skin, styled brown hair with short sides, a short trimmed beard, a beige linen shirt with open collar, a thin silver chain)")
DAN = ("@{DANIELA_MORA} (30-year-old Mexican woman, fair skin, long straight dyed-blond hair, big sunglasses pushed up on her head, a white linen blouse)")
BRI = ("@{BRIGIDA_ORTEGA} (52-year-old Mexican woman, light-brown skin, short black hair, red lipstick, large silver earrings, a black blazer over a colorful embroidered Oaxacan blouse)")
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

TEO_B = "@{TEOFILO_RUIZ} seen from behind (worn palm-leaf hat, white cotton shirt)"
IKE_B = "@{IKER_LASCURAIN} seen from behind (styled brown hair, beige linen shirt)"
DAN_B = "@{DANIELA_MORA} seen from behind (long straight dyed-blond hair, white linen blouse)"
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

NL = "standing on the LEFT in front of the wooden counter, a small clay cup in his hand"
IR = "standing on the RIGHT behind the wooden counter"
DR = "standing on the RIGHT behind the counter next to Iker, a cell phone in her hand"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Iker YA hablando, burlón, Teófilo de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Iker", f"Medium close-up of {IKE} {YARD0}, {IR}, talking from the very first frame, mocking, he pulls a clay cup away from the counter", TEO_B, "LEFT", "mocking, arrogant, loud",
     f"Medium close-up of {IKE} {YARD}, {IR}, talking from the very first frame, mocking", "LEFT")),
 ("c02", 6, S("c02", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, he smells the clay cup calmly, unbothered, a tiny smile", IKE_B, "RIGHT", "calm, slow, wise",
     f"Close-up of {NIC} {YARD}, {NL}, calm, smelling the clay cup", "RIGHT")),
 ("c03", 6, S("c03", "Daniela", f"Close-up of {DAN} {YARD0}, {DR}, laughing with disdain, rolling her eyes", TEO_B, "LEFT", "disdainful, laughing",
     f"Close-up of {DAN} {YARD}, {DR}, laughing with disdain", "LEFT")),
 ("c04", D8("c04"), S("c04", "Iker", f"Close-up of {IKE} {YARD0}, {IR}, proud, he taps a bottle on the counter", TEO_B, "LEFT", "proud, condescending",
     f"Close-up of {IKE} {YARD}, {IR}, proud", "LEFT")),
 ("c05", 6, S("c05", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, he looks up from under his hat, curious and calm", IKE_B, "RIGHT", "calm, curious, low",
     f"Close-up of {NIC} {YARD}, {NL}, curious and calm", "RIGHT")),
 ("c06", 6, S("c06", "Iker", f"Close-up of {IKE} {YARD0}, {IR}, careless, shrugging, a smug laugh", TEO_B, "LEFT", "careless, smug",
     f"Close-up of {IKE} {YARD}, {IR}, careless and smug", "LEFT")),
 ("r1", 6, one(f"Close-up of {NIC} {YARD}, {NL}, a slow knowing smile under the white mustache, he gently puts the clay cup down on the counter", "RIGHT") + " Slow push-in. No dialogue."),
 ("c07", 6, S("c07", "Daniela", f"Close-up of {DAN} {YARD0}, {DR}, impatient, she waves one hand dismissively", TEO_B, "LEFT", "impatient, rude",
     f"Close-up of {DAN} {YARD}, {DR}, impatient", "LEFT")),
 ("c08", 6, S("c08", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, he touches the brim of his palm hat politely, serene", DAN_B, "RIGHT", "serene, polite, calm",
     f"Close-up of {NIC} {YARD}, {NL}, serene", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Iker", f"Close-up of {IKE} {YARD0}, {IR}, he points away with his chin, then smooths his shirt, looking past the old man", TEO_B, "LEFT", "dismissive, excited",
     f"Close-up of {IKE} {YARD}, {IR}, dismissive", "LEFT")),
 # Entrada inesperada: Brígida saluda al viejo con respeto
 ("c10", 6, talk("c10", "Brígida", two(f"{BRI} on the RIGHT and {NIC} on the LEFT {YARD0}, framed from the waist up, both already in place; she takes his hand in both of hers with great respect and surprise, "
     f"slightly closer to the camera and in sharper focus") + " " + MOUTH("Brígida", "Teófilo"), "surprised, respectful, warm")),
 ("r2", 6, one(f"Close-up of {IKE} {YARD}, {IR}, his smile freezes and disappears, he goes pale, mouth slightly open, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, calm and firm, now with quiet authority, he does not look at the young man", "@{BRIGIDA_ORTEGA} seen from behind (short black hair, black blazer)", "RIGHT", "calm, firm, authoritative",
     f"Close-up of {NIC} {YARD}, {NL}, calm and authoritative", "RIGHT")),
 # CTA con carisma (después del BLACK): Teófilo a cámara
 ("c12", 10, talk("c12", "Teófilo", f"Close-up from the chest up of {NIC} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, touches the brim of his palm hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small wise smile. Nobody else around.",
     "charismatic, calm, wise, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("mocking", "amused"), ("arrogant", "proud"), ("disdainful", "amused"), ("rude", "impatient"), ("condescending", "proud"),
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
          "Vertical scene from a Mexican TV drama, realistic, bright midday sun at a rustic mezcal fair stall in Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, outdoor mezcal fair in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TEOFILO_RUIZ}", "an old Zapotec Mexican man with deep brown skin, white hair, a thin white mustache, a worn palm-leaf hat and a white cotton shirt"),
         ("@{IKER_LASCURAIN}", "a trendy Mexican man in his thirties with styled brown hair, a short beard, a beige linen shirt and a thin silver chain"),
         ("@{DANIELA_MORA}", "a Mexican woman around thirty with long dyed-blond hair, sunglasses on her head and a white linen blouse"),
         ("@{BRIGIDA_ORTEGA}", "a Mexican woman in her fifties with short black hair, red lipstick, silver earrings and a black blazer over an embroidered blouse"),
         (" @{LOC_FERIAMATATLAN}", "")]
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
