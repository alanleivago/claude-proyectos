"""Genera los clips de barrica-mascota PARTE 1 (La Barrica de Mascota, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #50 "La viña de la discordia" [CAPO] (Patronas y haciendas; trasladada a una destilería de raicilla y con otro contenido en la barrica), cierre tipo 7 (objeto que delata):
en la bodega de la hacienda raicillera de Mascota, los medios hermanos Julio (38) y Héctor (34) se pelean la destilería del padre muerto. La maestra raicillera Conchita (52) revela que el padre
dejó una barrica sellada para el día que se pelearan. Dentro no hay raicilla: hay una foto de las madres de los dos, abrazadas.
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
# Geografía fija (bodega): Julio a la DERECHA junto a la barrica sellada; Héctor a la IZQUIERDA junto a las filas de barricas; Conchita al CENTRO-DERECHA, un paso detrás de la barrica.
CEL0 = ("in the old barrel cellar of a raicilla distillery in a hacienda in Mascota, Jalisco @{LOC_BODEGAMASCOTA} in the warm late afternoon: rows of dark oak barrels on wooden racks, thick adobe walls, wooden beams, "
        "warm sunbeams with floating dust, one large old oak barrel standing apart sealed with wax; no readable text, no signs, no logos")
CEL = CEL0 + "; nobody else in the background, no extras, nobody besides the person described"
JUL = ("@{JULIO_MONTALVO} (38-year-old Mexican man, fair skin, short wavy light-brown hair, clean-shaven, a fitted black button-up shirt with rolled sleeves, a silver watch)")
HEC = ("@{HECTOR_MONTALVO} (34-year-old Mexican man, brown skin, short black curly hair, a short black beard, intense dark eyes, a dusty olive-green work shirt over a white t-shirt)")
CON = ("@{CONCHITA_RUELAS} (52-year-old Mexican woman, tanned skin, long grey-streaked black braid, calm wise dark eyes, a cream blouse with rolled sleeves under a brown leather apron)")
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

JUL_B = "@{JULIO_MONTALVO} seen from behind (short wavy light-brown hair, black button-up shirt)"
HEC_B = "@{HECTOR_MONTALVO} seen from behind (short black curly hair, olive-green work shirt)"
CON_B = "@{CONCHITA_RUELAS} seen from behind (long grey-streaked black braid, brown leather apron strings over a cream blouse)"
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

JR = "standing on the RIGHT with one hand on the big wax-sealed barrel"
HL = "standing on the LEFT by the rows of barrels"
CR = "standing on the RIGHT a step behind the big sealed barrel"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Julio YA hablando, la mano sobre la barrica, Héctor de espaldas en el borde.
 ("c01", 6, S("c01", "Julio", f"Medium close-up of {JUL} {CEL0}, {JR}, talking from the very first frame, hard and possessive, blocking the barrel", HEC_B, "LEFT", "hard, possessive, cold",
     f"Medium close-up of {JUL} {CEL}, {JR}, talking from the very first frame, hard and possessive", "LEFT")),
 ("c02", 6, S("c02", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, calm but defiant, arms crossed", JUL_B, "RIGHT", "defiant, calm, bitter",
     f"Close-up of {HEC} {CEL}, {HL}, defiant, arms crossed", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, proud, a contemptuous look at his half-brother", HEC_B, "LEFT", "proud, scornful, cold",
     f"Close-up of {JUL} {CEL}, {JR}, proud", "LEFT")),
 ("c04", 6, S("c04", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, stepping forward, voice hard, old resentment in his eyes", JUL_B, "RIGHT", "hard, resentful, cutting",
     f"Close-up of {HEC} {CEL}, {HL}, resentful", "RIGHT")),
 ("c05", 6, S("c05", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, furious, pointing a finger at him", HEC_B, "LEFT", "furious, sharp, warning",
     f"Close-up of {JUL} {CEL}, {JR}, furious, pointing", "LEFT")),
 ("c06", 6, S("c06", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, she raises one open hand between them, firm and calm", JUL_B, "LEFT", "firm, calm, motherly",
     f"Close-up of {CON} {CEL}, {CR}, firm and calm, hand raised", "LEFT")),
 ("c07", 6, S("c07", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, turning to her, impatient and condescending", CON_B, "LEFT", "impatient, condescending, curt",
     f"Close-up of {JUL} {CEL}, {JR}, impatient", "LEFT")),
 ("c08", D8("c08"), S("c08", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, unbothered, a calm steady look, wiping her hands on her apron", JUL_B, "LEFT", "calm, steady, proud",
     f"Close-up of {CON} {CEL}, {CR}, calm, wiping her hands", "LEFT")),
 ("c09", 6, S("c09", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, urgent, demanding, his voice cracking a little", CON_B, "RIGHT", "urgent, demanding, hurt",
     f"Close-up of {HEC} {CEL}, {HL}, urgent, demanding", "RIGHT")),
 ("c10", 6, S("c10", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, a sad gentle look at him, she shakes her head slowly", HEC_B, "LEFT", "sad, gentle, mysterious",
     f"Close-up of {CON} {CEL}, {CR}, sad gentle look", "LEFT")),
 ("c11", 6, S("c11", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, bitter, his voice low, grief under the anger", CON_B, "LEFT", "bitter, low, grieving",
     f"Close-up of {JUL} {CEL}, {JR}, bitter and grieving", "LEFT")),
 ("c12", D8("c12"), S("c12", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, she lays her palm on the wax seal of the big barrel, solemn", JUL_B, "LEFT", "solemn, slow, meaningful",
     f"Close-up of {CON} {CEL}, {CR}, solemn, palm on the wax seal", "LEFT")),
 ("r1", 6, f"Medium two-shot {CEL}: {JUL} on the RIGHT and {HEC} on the LEFT turn their heads slowly and look at each other across the big sealed barrel, tense, silent; only these two people. No dialogue."),
 ("c13", 6, S("c13", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, decided, nodding toward the barrel", CON_B, "RIGHT", "decided, firm, intense",
     f"Close-up of {HEC} {CEL}, {HL}, decided", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, protective of the barrel, worried", CON_B, "LEFT", "worried, protective, tense",
     f"Close-up of {JUL} {CEL}, {JR}, protective, worried", "LEFT")),
 ("c15", 6, S("c15", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, a small knowing smile, quiet", JUL_B, "LEFT", "quiet, knowing, calm",
     f"Close-up of {CON} {CEL}, {CR}, small knowing smile", "LEFT")),
 ("r2", 6, one(f"Close-up of {JUL} {CEL}, {JR}, stunned, he slowly takes his hand off the barrel, frowning, silent", "LEFT") + " No dialogue."),
 ("i01", 6, f"Close-up insert {CEL0}: a woman's hands in a brown leather apron break the old red wax seal and lift the round wooden lid off the big oak barrel; dust in the sunbeams; no faces, no readable text. No dialogue."),
 ("r3", 6, one(f"Close-up of {HEC} {CEL}, standing by the open barrel, leaning over it, looking inside, his face lit from below, frozen", "LEFT") + " No dialogue."),
 ("i02", 6, f"Close-up insert {CEL0}: inside the dry empty oak barrel lies a single old faded printed photograph of two young Mexican women hugging and laughing in front of this hacienda; no readable text, no letters. No dialogue."),
 ("c16", 6, S("c16", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, holding up an old faded photograph, his voice shaking, eyes wet", JUL_B, "RIGHT", "shaken, whispering, stunned",
     f"Close-up of {HEC} {CEL}, {HL}, holding up an old photo, shaken", "RIGHT")),
 ("c17", D8("c17"), S("c17", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, staring at the photo, pale, shaking his head in disbelief", HEC_B, "LEFT", "disbelief, shaken, low",
     f"Close-up of {JUL} {CEL}, {JR}, pale, in disbelief", "LEFT")),
 ("r4", 6, one(f"Close-up of {CON} {CEL}, {CR}, silent, she lowers her eyes with a sad knowing look, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Héctor a cámara
 ("c18", 10, talk("c18", "Héctor", f"Close-up from the chest up of {HEC} {CEL}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, holds up the old photo for a second, raises one eyebrow, gestures with his other open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("furious, sharp, warning", "angry, sharp"), ("hard, resentful, cutting", "hard, resentful"), ("proud, scornful, cold", "proud, cold"), ("furious", "angry"), ("break the old red wax seal", "open the old wax seal"), ("shaken", "moved"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm late afternoon sunbeams in an old oak barrel cellar of a distillery in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old barrel cellar with oak barrels in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{JULIO_MONTALVO}", "a Mexican man in his late thirties with wavy light-brown hair in a black button-up shirt"),
         ("@{HECTOR_MONTALVO}", "a Mexican man in his thirties with short black curly hair, a short beard and an olive-green work shirt"),
         ("@{CONCHITA_RUELAS}", "a Mexican woman in her fifties with a long grey-streaked braid and a brown leather apron"),
         (" @{LOC_BODEGAMASCOTA}", "")]
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
