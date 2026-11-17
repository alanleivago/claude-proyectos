"""Genera los clips de ponche-zitacuaro PARTE 1 (El Ponche de Zitácuaro, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre que pone orden a los hijos + Navidad (humillación + plazo -> la carpeta que nadie esperaba -> plazo invertido -> giro): en Nochebuena, en el patio de su casa en Zitácuaro,
la nuera Daniela (38) desprecia el ponche de don Gilberto (72) y su hijo mayor Héctor (42) anuncia que después de Navidad la casa se vende y el papá se va al cuartito de atrás; el hijo
menor Ramiro (38) lo defiende. Gilberto saca una carpeta: la casa ya está a nombre de Ramiro. Plazo invertido: hasta el Año Nuevo para que Héctor y Daniela saquen sus cosas.
Giro: Héctor ya le había prometido la casa a un comprador, el papá de Daniela.
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
# Geografía fija (patio): Gilberto y Ramiro a la IZQUIERDA (olla de ponche al fuego); Héctor y Daniela a la DERECHA (mesa de la cena).
YARD0 = ("in the patio of an old family house in Zitácuaro, Michoacán @{LOC_PATIOZITACUARO} on Christmas Eve at dusk: string lights and colorful papel picado overhead, "
         "a long dinner table with a white tablecloth, a big clay pot of fruit punch on a small wood fire, poinsettias, adobe walls with arches, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
POT = "a big clay pot of hot Mexican fruit punch with guavas and cinnamon sticks"
FOLDER = "a worn brown cardboard folder with papers inside"
GIL = ("@{GILBERTO_SALGADO} (72-year-old Mexican man, thin, brown wrinkled skin, short white hair, a neat white mustache, a dark-red wool sweater over a white collared shirt)")
RAM = ("@{RAMIRO_SALGADO} (38-year-old Mexican man, brown skin, short wavy black hair, a short black beard, a green flannel shirt)")
HEC = ("@{HECTOR_SALGADO} (42-year-old Mexican man, light-brown skin, receding black hair combed back, thin metal glasses, a navy-blue blazer over a light-blue shirt)")
DAN = ("@{DANIELA_ROBLES} (38-year-old Mexican woman, fair skin, long straight caramel-blonde hair, big gold hoop earrings, a fitted emerald-green velvet dress)")
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

# Bordes: Héctor o Daniela le hablan a Gilberto/Ramiro -> espalda LEFT; Gilberto o Ramiro les hablan -> espalda RIGHT.
GIL_B = "@{GILBERTO_SALGADO} seen from behind (short white hair, dark-red wool sweater, thin)"
RAM_B = "@{RAMIRO_SALGADO} seen from behind (short wavy black hair, green flannel shirt)"
HEC_B = "@{HECTOR_SALGADO} seen from behind (receding black hair combed back, navy-blue blazer)"
DAN_B = "@{DANIELA_ROBLES} seen from behind (long straight caramel-blonde hair, emerald-green velvet dress)"
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

GL = "standing on the LEFT beside the clay pot of punch on the fire"   # Gilberto
RL = "standing on the LEFT near the adobe arch"                         # Ramiro
HR = "standing on the RIGHT beside the dinner table"                    # Héctor
DR = "standing on the RIGHT by the dinner table"                        # Daniela

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Daniela YA hablando junto a la mesa; Gilberto de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Daniela", f"Medium close-up of {DAN} {YARD0}, {DR}, talking from the very first frame, arrogant, she wrinkles her nose at the clay pot", GIL_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {DAN} {YARD}, {DR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, calm and hurt, holding a wooden ladle", DAN_B, "RIGHT", "calm, hurt, slow",
     f"Close-up of {GIL} {YARD}, {GL}, calm and hurt", "RIGHT")),
 ("c03", 6, S("c03", "Héctor", f"Close-up of {HEC} {YARD0}, {HR}, cold and practical, he adjusts his glasses", GIL_B, "LEFT", "cold, practical",
     f"Close-up of {HEC} {YARD}, {HR}, cold and practical", "LEFT")),
 ("r1", 6, f"Medium shot of {RAM} {YARD}, {RL}, already in place, he stops and looks up, upset and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green flannel shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Ramiro", one(f"Close-up of {RAM} {YARD}, {RL}, upset and protective", "RIGHT"), "upset, protective")),
 ("c05", D8("c05"), S("c05", "Daniela", f"Close-up of {DAN} {YARD0}, {DR}, she laughs once, mocking", RAM_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {DAN} {YARD}, {DR}, she laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {POT} tips over on the ground by the fire and the punch with guavas spills across the floor tiles; only the pot and the punch, no face, no people. No dialogue."),
 ("c06", D8("c06"), S("c06", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, his eyes shine, hurt but dignified", HEC_B, "RIGHT", "hurt, dignified",
     f"Close-up of {GIL} {YARD}, {GL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Héctor", one(f"Close-up of {HEC} {YARD}, {HR}, cold, he puts his hands in his pockets", "LEFT"), "cold, final")),
 ("r2", 6, f"Medium shot of {GIL} {YARD}, he slowly bends down and lifts the empty clay pot from the floor with both hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a dark-red sweater')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Gilberto", two(f"{GIL} on the LEFT and {RAM} on the RIGHT, close together by the adobe arch {YARD0}, framed from the waist up; "
     f"Gilberto speaks calmly to his son, slightly closer to the camera and in sharper focus") + " " + MOUTH("Gilberto", "Ramiro"), "calm, firm, low"),
   talk("c08", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Daniela", one(f"Close-up of {DAN} {YARD}, {DR}, amused, arms crossed, she rolls her eyes", "LEFT"), "mocking, amused")),
 ("r3", 6, f"Medium shot of {RAM} {YARD}, {RL}, already in place, holding {FOLDER} with both hands, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green flannel shirt')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, calm and firm, holding {FOLDER} open", HEC_B, "RIGHT", "calm, firm",
     f"Close-up of {GIL} {YARD}, {GL}, calm and firm, holding {FOLDER} open", "RIGHT")),
 ("c11", 6, talk("c11", "Héctor", one(f"Close-up of {HEC} {YARD}, {HR}, shocked, he takes off his glasses", "LEFT"), "shocked, nervous")),
 ("c12", 6, S("c12", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, serious, a calm sad look", HEC_B, "RIGHT", "serious, slow",
     f"Close-up of {GIL} {YARD}, {GL}, serious", "RIGHT")),
 ("c13", 6, talk("c13", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, cold and final, he closes the folder", "RIGHT"), "cold, final, slow")),
 ("r4", 6, one(f"Close-up of {DAN} {YARD}, {DR}, in silence, her smile disappears, she swallows, speechless", "LEFT") + " Slow push-in. No dialogue."),
 ("c14", D8("c14"), (talk("c14", "Ramiro", two(f"{GIL} on the LEFT and {RAM} on the RIGHT, facing each other in profile under the string lights {YARD0}, framed from the waist up; "
     f"Ramiro, moved, speaks softly to his father, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ramiro", "Gilberto"), "moved, soft"),
   talk("c14", "Ramiro", one(f"Close-up of {RAM} {YARD}, {RL}, moved, his eyes shine", "RIGHT"), "moved, soft"))),
 ("c15", 6, talk("c15", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, a warm small smile that turns serious", "RIGHT"), "warm, then serious")),
 ("c16", 6, talk("c16", "Ramiro", one(f"Close-up of {RAM} {YARD}, {RL}, worried", "RIGHT"), "worried, low")),
 ("c17", D8("c17"), (talk("c17", "Gilberto", two(f"{RAM} on the LEFT and {GIL} on the RIGHT, facing each other under the string lights {YARD0}, framed from the waist up; "
     f"Gilberto speaks low to his son, slightly closer to the camera and in sharper focus") + " " + MOUTH("Gilberto", "Ramiro"), "low, grave, slow"),
   talk("c17", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, low and grave", "RIGHT"), "low, grave, slow"))),
 # CTA con carisma (después del BLACK): Gilberto solo, a cámara
 ("c18", 10, talk("c18", "Gilberto", f"Close-up from the chest up of {GIL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small warm half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Mi papá no se merece esto.", "Mi papá no merece esto."), ("tips over on the ground", "sits on the ground"), ("spills across the floor tiles", "steams"),
        ("shocked", "surprised"), ("speechless", "quiet"), ("contemptuous", "cool"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm string lights at dusk in a family house patio decorated for Christmas Eve in Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family patio on Christmas Eve with papel picado, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm evening light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GILBERTO_SALGADO}", "a thin Mexican man in his seventies with short white hair, a neat white mustache and a dark-red wool sweater"),
         ("@{RAMIRO_SALGADO}", "a Mexican man in his late thirties with short wavy black hair, a short black beard and a green flannel shirt"),
         ("@{HECTOR_SALGADO}", "a Mexican man in his forties with receding black hair, thin metal glasses and a navy-blue blazer"),
         ("@{DANIELA_ROBLES}", "a Mexican woman in her late thirties with long straight caramel-blonde hair, gold hoop earrings and an emerald-green velvet dress"),
         (" @{LOC_PATIOZITACUARO}", "")]
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
