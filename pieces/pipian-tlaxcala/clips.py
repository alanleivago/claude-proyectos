"""Genera los clips de pipian-tlaxcala PARTE 1 (El Pipián de Tlaxcala, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #25 "La suegra en la cocina" (traición familiar), cierre tipo 7 (objeto que delata): en la comida del domingo, doña Cristina (66), dueña del restaurante más famoso de Tlaxcala,
humilla a su nuera Sofía (30) por su pipián y tira el plato; su hijo Emilio (34) intenta calmarla. Sofía saca el cuaderno de recetas de su mamá, Amparo Juárez: es el mismo pipián del menú
de Cristina. Cristina reconoce la letra: "Yo creí que ese cuaderno se había perdido."
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
# Geografía fija (comedor): Cristina en la cabecera a la DERECHA; Sofía de pie a la IZQUIERDA junto a la mesa; Emilio sentado a la IZQUIERDA junto a Sofía.
YARD0 = ("in the dining room of a large old family house in Tlaxcala @{LOC_COMEDORTLAXCALA} at midday on a Sunday: a long dark wooden table with clay dishes and talavera plates, "
         "a pot of green pipián sauce, white walls, a window to a garden, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
BOOK = "an old worn notebook with a faded cloth cover"
CRI = ("@{CRISTINA_ARRIAGA} (66-year-old Mexican woman, fair skin, short silver hair styled with volume, gold-rimmed glasses on a chain, a burgundy silk blouse, a big gold brooch)")
SOF = ("@{SOFIA_JUAREZ} (30-year-old Mexican woman, brown skin, long black hair in a side braid, a mustard-yellow cardigan over a white blouse)")
EMI = ("@{EMILIO_ARRIAGA} (34-year-old Mexican man, fair skin, short curly brown hair, clean-shaven, a light-blue sweater over a white collared shirt)")
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

CRI_B = "@{CRISTINA_ARRIAGA} seen from behind (short silver hair with volume, burgundy silk blouse)"
SOF_B = "@{SOFIA_JUAREZ} seen from behind (long black hair in a side braid, mustard-yellow cardigan)"
EMI_B = "@{EMILIO_ARRIAGA} seen from behind (short curly brown hair, light-blue sweater)"
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

CR = "sitting at the head of the table on the RIGHT"
SL = "standing on the LEFT beside the table"
EL = "sitting at the table on the LEFT"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Cristina YA hablando con la cuchara en la mano; Sofía de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Cristina", f"Medium close-up of {CRI} {YARD0}, {CR}, talking from the very first frame, haughty, she drops a spoon onto her plate of green pipián", SOF_B, "LEFT", "haughty, cold, mocking",
     f"Medium close-up of {CRI} {YARD}, {CR}, talking from the very first frame, haughty", "LEFT")),
 ("c02", 6, S("c02", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, polite, hiding her hurt, hands clasped", CRI_B, "RIGHT", "polite, hurt, soft",
     f"Close-up of {SOF} {YARD}, {SL}, polite, hiding her hurt", "RIGHT")),
 ("c03", 6, talk("c03", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, she takes off her glasses, cold", "LEFT"), "cold, proud")),
 ("r1", 6, f"Medium shot of {EMI} {YARD}, {EL}, already in place, uneasy, he puts down his fork and looks from one woman to the other, "
           f"{gaze('RIGHT')}; {ALONE}; {NODOUBLE('man in a light-blue sweater')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Emilio", f"Close-up of {EMI} {YARD0}, {EL}, uneasy, trying to calm things", CRI_B, "RIGHT", "uneasy, soft",
     f"Close-up of {EMI} {YARD}, {EL}, uneasy", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, she raises one hand to silence him, haughty", EMI_B, "LEFT", "haughty, sharp",
     f"Close-up of {CRI} {YARD}, {CR}, haughty", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a talavera plate of green pipián is scraped off with a spoon into an empty clay bowl at the edge of the table; only the plate, the spoon and a hand with a gold ring, no face. No dialogue."),
 ("c06", 6, S("c06", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, her eyes shine, dignified", CRI_B, "RIGHT", "hurt, dignified, low",
     f"Close-up of {SOF} {YARD}, {SL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, a superior smile, she folds her napkin", "LEFT"), "superior, mocking")),
 ("c08", 6, talk("c08", "Sofía", two(f"{SOF} standing on the LEFT and {EMI} sitting on the RIGHT at the table {YARD0}, framed from the waist up; Sofía, suddenly calm and sure, speaks to her husband, "
     f"slightly closer to the camera and in sharper focus") + " " + MOUTH("Sofía", "Emilio"), "calm, sure, low")),
 ("c09", 6, talk("c09", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, she laughs once, scornful", "LEFT"), "scornful, amused")),
 ("r2", 6, f"Medium shot of {SOF} {YARD}, {SL}, already in place, she opens {BOOK} with both hands and turns the yellowed pages slowly, calm; {PRES}; {ALONE}; {NODOUBLE('woman in a mustard cardigan')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, reading aloud from {BOOK}, calm and clear", CRI_B, "RIGHT", "calm, clear, slow",
     f"Close-up of {SOF} {YARD}, {SL}, reading aloud from {BOOK}", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, she turns the open notebook toward her mother-in-law, firm", CRI_B, "RIGHT", "firm, calm",
     f"Close-up of {SOF} {YARD}, {SL}, she holds up the open notebook, firm", "RIGHT")),
 ("c12", 6, S("c12", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, she puts on her glasses and stares at the notebook, her face goes pale", SOF_B, "LEFT", "shaken, whispering",
     f"Close-up of {CRI} {YARD}, {CR}, she stares, pale", "LEFT")),
 ("r3", 6, one(f"Close-up of {CRI} {YARD}, {CR}, in silence, pale, her hand slowly goes to her gold brooch, she cannot speak", "LEFT") + " Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Emilio", one(f"Close-up of {EMI} {YARD}, {EL}, confused and worried, looking at his mother", "RIGHT"), "confused, worried")),
 ("c14", 6, talk("c14", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, she whispers to herself, her eyes fixed on the notebook, lost in memory", "LEFT"), "whispering, shaken, slow")),
 # CTA con carisma (después del BLACK): Sofía sola, a cámara
 ("c15", 10, talk("c15", "Sofía", f"Close-up from the chest up of {SOF} {YARD}, alone, holding {BOOK} against her chest, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, taps the notebook cover, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Sofía, este pipián sabe a comida de fonda.", "Sofía, este pipián no sabe como el mío."), ("scornful", "amused"), ("haughty", "proud"), ("shaken", "surprised"),
        ("is scraped off with a spoon into an empty clay bowl", "sits untouched"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm midday light in the dining room of an old family house in Tlaxcala during Sunday lunch, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family dining room with clay dishes, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CRISTINA_ARRIAGA}", "an elegant Mexican woman in her sixties with short silver hair, gold-rimmed glasses on a chain and a burgundy silk blouse"),
         ("@{SOFIA_JUAREZ}", "a Mexican woman around thirty with brown skin, a long black side braid and a mustard-yellow cardigan"),
         ("@{EMILIO_ARRIAGA}", "a Mexican man in his thirties with short curly brown hair and a light-blue sweater"),
         (" @{LOC_COMEDORTLAXCALA}", "")]
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
