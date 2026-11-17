"""Genera los clips de cantaro-tonala PARTE 1 (El Cántaro de Tonalá, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra + padre que pone orden (humillación + plazo -> la llamada que la villana no cree -> llega el patriarca -> plazo invertido -> giro familiar): en el patio de una casona de
alfareros de Tonalá, Jalisco, la madrastra Fabiola (46) rompe el cántaro que hizo la mamá de Mariana (26) y le da plazo "antes del domingo"; la ama de llaves Remedios (62) la defiende.
Mariana llama a su papá don Anselmo (68), dueño del taller más grande de Tonalá. Plazo invertido. Giro: la mamá de Mariana no murió en ese viaje, y Fabiola sabe dónde está.
Copia del clips.py de sombrero-sahuayo (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
# Geografía fija (patio): Mariana y Remedios a la IZQUIERDA (repisas de barro); Fabiola y Anselmo a la DERECHA (arcos de la entrada).
YARD0 = ("in the inner courtyard of a large old family house in Tonalá, Jalisco @{LOC_PATIOTONALA} in the afternoon: terracotta floor, arches, potted plants, "
         "wooden shelves with burnished clay pottery and painted clay water jugs, a stone fountain, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
JUG = "a large old hand-painted clay water jug"
MAR = ("@{MARIANA_OCHOA} (26-year-old Mexican woman, light-brown skin, long straight black hair in a low ponytail, a cream cotton blouse, light-blue jeans)")
FAB = ("@{FABIOLA_LEDESMA} (46-year-old Mexican woman, fair skin, short styled auburn hair, red lipstick, pearl earrings, a fitted wine-red dress)")
REM = ("@{REMEDIOS_CANO} (62-year-old Mexican woman, brown skin, grey hair in a bun, round glasses, a brown knitted cardigan over a floral blouse)")
ANS = ("@{ANSELMO_OCHOA} (68-year-old Mexican man, tall and broad, light-brown skin, grey hair, a thick grey mustache, a cream panama hat, a white long-sleeve guayabera)")
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

# Bordes: Fabiola o Anselmo le hablan a Mariana/Remedios -> espalda LEFT; Mariana o Remedios les hablan -> espalda RIGHT.
MAR_B = "@{MARIANA_OCHOA} seen from behind (long straight black hair in a low ponytail, cream blouse)"
REM_B = "@{REMEDIOS_CANO} seen from behind (grey hair in a bun, brown knitted cardigan)"
FAB_B = "@{FABIOLA_LEDESMA} seen from behind (short styled auburn hair, fitted wine-red dress)"
ANS_B = "@{ANSELMO_OCHOA} seen from behind (cream panama hat, white guayabera, broad shoulders)"
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

ML = "standing on the LEFT by the shelves of clay pottery"      # Mariana
RL = "standing on the LEFT near the stone fountain"             # Remedios
FR = "standing on the RIGHT under an arch of the courtyard"     # Fabiola
AR = "standing on the RIGHT under an arch, the entrance behind him"  # Anselmo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fabiola YA hablando en el patio; Mariana de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Fabiola", f"Medium close-up of {FAB} {YARD0}, {FR}, talking from the very first frame, arrogant, she taps {JUG} on the shelf with one fingernail", MAR_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {FAB} {YARD}, {FR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Mariana", f"Close-up of {MAR} {YARD0}, {ML}, hurt but firm, one hand resting on {JUG}", FAB_B, "RIGHT", "hurt, firm",
     f"Close-up of {MAR} {YARD}, {ML}, hurt but firm", "RIGHT")),
 ("c03", 6, talk("c03", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, a cold smile, she adjusts her bracelet", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {REM} {YARD}, {RL}, already in place holding a folded cloth, she stops and steps forward, worried and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('older woman in a brown cardigan')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Remedios", f"Close-up of {REM} {YARD0}, {RL}, respectful but firm", FAB_B, "RIGHT", "respectful, firm",
     f"Close-up of {REM} {YARD}, {RL}, respectful but firm", "RIGHT")),
 ("c05", 6, S("c05", "Fabiola", f"Close-up of {FAB} {YARD0}, {FR}, she laughs once, mocking", REM_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {FAB} {YARD}, {FR}, she laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {JUG} falls from a wooden shelf onto the terracotta floor and breaks into pieces; only the jug and the floor, no face, no people. No dialogue."),
 ("c06", 6, S("c06", "Mariana", f"Close-up of {MAR} {YARD0}, {ML}, her eyes shine, she looks down at the broken pieces", FAB_B, "RIGHT", "hurt, low",
     f"Close-up of {MAR} {YARD}, {ML}, her eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, mocking, she brushes off her hands", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {MAR} {YARD}, she slowly crouches and gathers broken pieces of painted clay from the terracotta floor into her hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('young woman with a black ponytail')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Mariana", two(f"{MAR} on the LEFT holding broken clay pieces and {REM} on the RIGHT, close together by the fountain {YARD0}, framed from the waist up; "
     f"Mariana speaks firmly to the older woman, slightly closer to the camera and in sharper focus") + " " + MOUTH("Mariana", "Remedios"), "firm, decided, low"),
   talk("c08", "Mariana", one(f"Close-up of {MAR} {YARD}, {ML}, firm and decided", "RIGHT"), "firm, decided, low"))),
 ("c09", 6, talk("c09", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, amused, arms crossed", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs stopping slowly on a cobblestone street of colonial houses with clay pottery displayed on the sidewalks in Tonalá, Jalisco, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {ANS} {YARD}, {AR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream panama hat')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Anselmo", f"Close-up of {ANS} {YARD0}, {AR}, warm and protective, he looks at his daughter", MAR_B, "LEFT", "warm, protective",
     f"Close-up of {ANS} {YARD}, {AR}, warm and protective", "LEFT")),
 ("c11", 6, talk("c11", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, she turns around, her smile gone, pale, then forces a sweet smile", "RIGHT"), "surprised, nervous, falsely sweet")),
 ("c12", D8("c12"), talk("c12", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, cold and serious, he looks at his wife", "RIGHT"), "cold, serious, slow")),
 ("c13", 6, talk("c13", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, he gestures toward the entrance, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {FAB} {YARD}, she lowers her head and slowly takes off her pearl earrings, quiet and defeated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman in a wine-red dress')}. No dialogue."),
 ("c14", 6, S("c14", "Mariana", f"Close-up of {MAR} {YARD0}, {ML}, grateful, a small smile, her eyes shine", ANS_B, "RIGHT", "grateful, warm",
     f"Close-up of {MAR} {YARD}, {ML}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Remedios", f"Close-up of {REM} {YARD0}, {RL}, serious, she looks at the old man meaningfully", ANS_B, "RIGHT", "serious, low",
     f"Close-up of {REM} {YARD}, {RL}, serious", "RIGHT")),
 ("c16", 6, talk("c16", "Mariana", one(f"Close-up of {MAR} {YARD}, {ML}, confused and worried", "RIGHT"), "confused, worried")),
 ("c17", 6, (talk("c17", "Anselmo", two(f"{MAR} on the LEFT and {ANS} on the RIGHT, facing each other in the courtyard {YARD0}, framed from the waist up; "
     f"Anselmo, his eyes shine, speaks low to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Anselmo", "Mariana"), "low, sad, slow"),
   talk("c17", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, low and sad, his eyes shine", "LEFT"), "low, sad, slow"))),
 # CTA con carisma (después del BLACK): Mariana sola, a cámara
 ("c18", 10, talk("c18", "Mariana", f"Close-up from the chest up of {MAR} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a loose strand of hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Por qué me odia tanto?", "¿Por qué me hace esto?"), ("falls from a wooden shelf onto the terracotta floor and breaks into pieces", "lies on the terracotta floor, cracked"),
        ("defeated", "quiet"), ("contemptuous", "cool"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in the courtyard of an old family house with clay pottery in Tonalá, Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial house courtyard with clay pottery in a Mexican town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MARIANA_OCHOA}", "a Mexican woman in her twenties with long straight black hair in a low ponytail and a cream cotton blouse"),
         ("@{FABIOLA_LEDESMA}", "an elegant Mexican woman in her forties with short styled auburn hair, pearl earrings and a fitted wine-red dress"),
         ("@{REMEDIOS_CANO}", "a Mexican woman in her sixties with grey hair in a bun, round glasses and a brown knitted cardigan"),
         ("@{ANSELMO_OCHOA}", "a tall broad Mexican man in his late sixties with a thick grey mustache, a cream panama hat and a white guayabera"),
         (" @{LOC_PATIOTONALA}", "")]
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
