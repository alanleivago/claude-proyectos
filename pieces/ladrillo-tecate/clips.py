"""Genera los clips de ladrillo-tecate PARTE 1 (El Ladrillo de Tecate, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la figura de poder estaba ahí de incógnito -> plazo invertido -> giro familiar): en una ladrillera de Tecate, Santiago (33), hijo de un constructor,
le tira el ladrillo a don Clemente (72) y le da plazo "antes de que se enfríe el horno"; el peón Teófilo (45), que lleva un mes trabajando ahí, hace una llamada: es "Don Teo", el que manda en Tecate.
Giro: Teo vino a buscar al hombre que embarazó a su madre Rosa hace 45 años... y es Clemente, su padre.
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
# Geografía fija (patio de la ladrillera): de izquierda a derecha Clemente (junto a las hileras de adobe), Teófilo (junto a la pila de lodo y los moldes), Santiago (a la DERECHA junto a su camioneta).
YARD0 = ("in an artisan brick kiln yard in Tecate, Baja California @{LOC_LADRILLERA} in the late afternoon: rows of fresh adobe bricks drying on the ground, tall stacks of red fired bricks, "
         "a big old brick kiln with light smoke, dry rocky hills behind, golden dusty light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHONE = "an old small phone"
CLE = ("@{CLEMENTE_ARCE} (72-year-old Mexican man, tall and thin, sunburned light-brown skin, thin white hair, a short white beard, a faded denim long-sleeve shirt with clay dust, a wide straw hat)")
TEO = ("@{TEOFILO_MEDINA} (45-year-old Mexican man, strong build, brown skin, short black hair with grey temples, a thick black mustache, a worn grey long-sleeve work shirt with mud stains, "
       "a plain faded green cap)")
SAN = ("@{SANTIAGO_DELVALLE} (33-year-old Mexican man, light skin, styled light-brown hair, a trimmed beard, a light-blue linen shirt, white chinos, an expensive watch)")
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

# Bordes: orden C - T | S. Santiago le habla a Clemente/Teo -> espalda LEFT; Clemente o Teo le hablan a Santiago -> espalda RIGHT;
# Clemente le habla a Teo -> espalda de Teo RIGHT; Teo le habla a Clemente -> espalda de Clemente LEFT.
CLE_B = "@{CLEMENTE_ARCE} seen from behind (wide straw hat, faded denim shirt, tall and thin)"
TEO_B = "@{TEOFILO_MEDINA} seen from behind (plain faded green cap, worn grey work shirt, strong shoulders)"
SAN_B = "@{SANTIAGO_DELVALLE} seen from behind (styled light-brown hair, light-blue linen shirt)"
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

CL = "standing on the LEFT beside rows of drying adobe bricks"                    # Clemente
TL = "standing beside a mud pit with wooden brick molds"                           # Teófilo
SR = "standing on the RIGHT beside a shiny grey pickup truck"                      # Santiago

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Santiago YA hablando junto a su camioneta; Clemente de espaldas (LEFT). Plazo: antes de que se enfríe el horno.
 ("c01", D8("c01"), S("c01", "Santiago", f"Medium close-up of {SAN} {YARD0}, {SR}, talking from the very first frame, arrogant, he looks around the yard with disdain", CLE_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {SAN} {YARD}, {SR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Clemente", f"Close-up of {CLE} {YARD0}, {CL}, firm and proud, dust on his face", SAN_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {CLE} {YARD}, {CL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, a mocking smile, he glances at the worker", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {TEO} {YARD}, {TL}, already in place pressing mud into a wooden brick mold, he stops, wipes his hands and slowly straightens up, calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green cap')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, calm and respectful, his eyes steady", SAN_B, "RIGHT", "calm, respectful, firm",
     f"Close-up of {TEO} {YARD}, {TL}, calm, his eyes steady", "RIGHT")),
 ("c05", 6, S("c05", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, he laughs once with contempt", TEO_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {SAN} {YARD}, {SR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a brown loafer slowly pushes over a neat row of fresh adobe bricks and they fall and crack on the dusty ground; only the shoe and the bricks, no face. No dialogue."),
 ("c06", 6, S("c06", "Clemente", f"Close-up of {CLE} {YARD0}, {CL}, indignant, his eyes shine, he gestures at the cracked bricks", SAN_B, "RIGHT", "indignant, hurt",
     f"Close-up of {CLE} {YARD}, {CL}, indignant, his eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, he dusts off his hands, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {TEO} {YARD}, {TL}, calm, he takes {PHONE} out of his shirt pocket and dials one number with his thumb, his eyes cold and steady, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Teófilo", one(f"Close-up of {TEO} {YARD}, {TL}, holding {PHONE} to his ear, calm and commanding, his voice low", "RIGHT"), "calm, commanding, low")),
 ("c09", 6, S("c09", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, mocking, he shakes his head", TEO_B, "LEFT", "mocking, amused",
     f"Close-up of {SAN} {YARD}, {SR}, mocking", "LEFT")),
 ("i02", 6, "Wide shot of three black SUVs driving slowly in a line along a dusty dirt road between rocky hills and boulders in Tecate, Baja California, golden afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {TEO} {YARD}, {TL}, black SUVs parked far behind him, he slowly takes off his faded cap and stands tall, calm and powerful, his whole presence changes, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey work shirt')}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, his smile gone, pale and surprised", "LEFT"), "surprised, nervous")),
 ("c11", D8("c11"), S("c11", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, holding his cap, cold and serious", SAN_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {TEO} {YARD}, {TL}, holding his cap, cold and serious", "RIGHT")),
 ("c12", 6, talk("c12", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, nervous, a forced smile, he raises both palms", "LEFT"), "nervous, pleading")),
 ("c13", D8("c13"), talk("c13", "Teófilo", one(f"Close-up of {TEO} {YARD}, {TL}, he gestures slowly toward the cracked bricks on the ground, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {SAN} {YARD}, kneeling on the dusty ground in his white chinos, he picks up cracked adobe bricks one by one and stacks them again, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a light-blue shirt')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Clemente", f"Close-up of {CLE} {YARD0}, {CL}, amazed and confused, he looks at the worker", TEO_B, "RIGHT", "amazed, confused, slow",
     f"Close-up of {CLE} {YARD}, {CL}, amazed and confused", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, serious, his voice softer, his eyes shine a little", CLE_B, "LEFT", "serious, soft, slow",
     f"Close-up of {TEO} {YARD}, {TL}, serious, his voice softer", "LEFT")),
 ("c16", D8("c16"), talk("c16", "Clemente", one(f"Close-up of {CLE} {YARD}, {CL}, surprised, a distant memory in his eyes", "RIGHT"), "surprised, low, remembering")),
 ("c17", D8("c17"), (talk("c17", "Teófilo", two(f"{CLE} on the LEFT and {TEO} on the RIGHT, in profile facing each other beside the drying bricks {YARD0}, framed from the waist up; "
     f"Teófilo steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Teófilo", "Clemente"), "low, serious, slow"),
   talk("c17", "Teófilo", one(f"Close-up of {TEO} {YARD}, {TL}, low and serious", "LEFT"), "low, serious, slow"))),
 ("c18", 6, talk("c18", "Clemente", one(f"Close-up of {CLE} {YARD}, {CL}, stunned, his voice small", "RIGHT"), "stunned, small, slow")),
 ("c19", 6, S("c19", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, his eyes shine, a small trembling smile", CLE_B, "LEFT", "moved, soft, slow",
     f"Close-up of {TEO} {YARD}, {TL}, his eyes shine", "LEFT")),
 # CTA con carisma (después del BLACK): Teófilo solo, a cámara
 ("c20", 10, talk("c20", "Teófilo", f"Close-up from the chest up of {TEO} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts his faded cap back on, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("La corrió su papá cuando supo que estaba embarazada.", "Su papá la mandó lejos cuando supo que esperaba un hijo."), ("¿Embarazada?", "¿Un hijo?"),
        ("¿Usted es el que manda en Tecate?", "¿Usted es don Teo, el de Tecate?"), ("Tú regrésate a tu lodo.", "Tú regresa a tu trabajo."),
        ("pushes over", "moves"), ("crack", "rest"), ("cracked", "fallen"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"),
        ("stunned", "surprised"), ("commanding", "serious"), ("powerful", "serious"), ("trembling", "small"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden dusty afternoon in an artisan brick kiln yard in Baja California, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, brick kiln yard with rows of drying adobe bricks in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CLEMENTE_ARCE}", "a tall thin elderly Mexican man with a short white beard, a faded denim shirt and a wide straw hat"),
         ("@{TEOFILO_MEDINA}", "a strong Mexican man in his forties with a thick black mustache, a worn grey work shirt and a faded green cap"),
         ("@{SANTIAGO_DELVALLE}", "a light-skinned Mexican man in his thirties with a trimmed beard and a light-blue linen shirt"),
         (" @{LOC_LADRILLERA}", "")]
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
