"""Genera los clips de laca-olinala PARTE 1 (La Laca de Olinalá, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2, saga Evaristo): en su cumpleaños 80, en Olinalá, Guerrero, don Isauro recibe a sus hijos Germán (45) y Rocío (42) después de veinte años:
traen un papel para quedarse con la casa "antes de que se acabe la comida" y humillan a Chabela (50), la que lo cuida. Isauro saca el cofre rojo de laca: la casa ya es de Chabela.
Giro: Chabela es su hija mayor.
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
# Geografía fija (patio, mesa del cumpleaños): Isauro (sentado) y Chabela (de pie detrás de él) a la IZQUIERDA; Germán y Rocío a la DERECHA, del otro lado de la mesa.
YARD0 = ("in the patio of a family house and lacquer workshop in Olinalá, Guerrero @{LOC_PATIOLACA} at midday: a long wooden table with a simple birthday lunch and colorful hand-painted lacquered "
         "wooden boxes, adobe walls with orange bougainvillea, green mountains behind, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CHEST = "a red hand-painted lacquered wooden chest with flowers and birds"
PAPER = "a few typed papers"
ISA = ("@{ISAURO_NAVA} (80-year-old Mexican man, thin, brown wrinkled skin, white hair combed back, a thin white mustache, a light-beige long-sleeve shirt buttoned to the neck)")
GER = ("@{GERMAN_NAVA} (45-year-old Mexican man, balding with short dark hair on the sides, rectangular glasses, a black mustache, a white dress shirt with a navy tie)")
ROC = ("@{ROCIO_NAVA} (42-year-old Mexican woman, light-brown skin, shoulder-length dyed caramel hair, big sunglasses on her head, an emerald-green dress, a gold necklace)")
CHA = ("@{CHABELA_RUIZ} (50-year-old Mexican woman, brown skin, black hair with a grey streak in a low bun, a plain lilac blouse, a white apron)")
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

# Bordes: Germán o Rocío le hablan a Isauro/Chabela -> espalda LEFT; Isauro o Chabela les hablan -> espalda RIGHT.
ISA_B = "@{ISAURO_NAVA} seen from behind (white hair combed back, light-beige shirt, thin shoulders)"
CHA_B = "@{CHABELA_RUIZ} seen from behind (black hair with a grey streak in a low bun, lilac blouse, white apron strings)"
GER_B = "@{GERMAN_NAVA} seen from behind (balding head with short dark hair on the sides, white dress shirt)"
ROC_B = "@{ROCIO_NAVA} seen from behind (shoulder-length caramel hair, emerald-green dress)"
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

IL = "sitting on the LEFT at the head of the long wooden table, a small lacquered box and a brush in front of him"   # Isauro
CL = "standing on the LEFT behind the old man's chair"                                                              # Chabela
GR = f"standing on the RIGHT across the table, holding {PAPER}"                                                    # Germán
RR = "standing on the RIGHT across the table"                                                                       # Rocío

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Germán YA hablando, le pone los papeles enfrente al padre; Isauro de espaldas (LEFT). Plazo: antes de que se acabe la comida.
 ("c01", D8("c01"), S("c01", "Germán", f"Medium close-up of {GER} {YARD0}, {GR}, talking from the very first frame, impatient, he pushes the papers and a pen across the table", ISA_B, "LEFT", "impatient, cold, bossy",
     f"Medium close-up of {GER} {YARD}, {GR}, talking from the very first frame, impatient", "LEFT")),
 ("c02", D8("c02"), S("c02", "Isauro", f"Close-up of {ISA} {YARD0}, {IL}, hurt but dignified, he puts down the brush", GER_B, "RIGHT", "hurt, dignified, slow",
     f"Close-up of {ISA} {YARD}, {IL}, hurt but dignified", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, she rolls her eyes, fake sweet", "LEFT"), "fake sweet, impatient")),
 ("r1", 6, f"Medium shot of {CHA} {YARD}, {CL}, already in place holding a small birthday cake with candles, she stops and looks at the visitors, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a lilac blouse')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Chabela", f"Close-up of {CHA} {YARD0}, {CL}, calm and firm, protective", GER_B, "RIGHT", "calm, firm, protective",
     f"Close-up of {CHA} {YARD}, {CL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Germán", f"Close-up of {GER} {YARD0}, {GR}, contemptuous, he does not even look at her", CHA_B, "LEFT", "contemptuous, cold",
     f"Close-up of {GER} {YARD}, {GR}, contemptuous", "LEFT")),
 ("c06", D8("c06"), talk("c06", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, a cold smile, she waves her hand", "LEFT"), "cold, mocking")),
 ("i01", 6, f"Close-up insert {YARD0}: a man's hand slaps {PAPER} and a pen down on the wooden table next to a small colorful lacquered box; only the hand, the papers and the box, no face. No dialogue."),
 ("c07", D8("c07"), talk("c07", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, sad, his eyes shine", "RIGHT"), "sad, slow, quiet")),
 ("c08", 6, S("c08", "Germán", f"Close-up of {GER} {YARD0}, {GR}, impatient, he taps the papers", ISA_B, "LEFT", "impatient, cold",
     f"Close-up of {GER} {YARD}, {GR}, impatient", "LEFT")),
 ("r2", 6, one(f"Close-up of {ISA} {YARD}, {IL}, in silence, he slowly turns his head to look at the caretaker and gives a small gentle smile", "LEFT") + " Slow push-in. No dialogue."),
 ("c09", 6, (talk("c09", "Isauro", two(f"{ISA} sitting on the LEFT and {CHA} standing on the RIGHT beside his chair, looking at each other at the table {YARD0}, framed from the waist up; "
     f"Isauro, calm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Isauro", "Chabela"), "calm, gentle"),
   talk("c09", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, calm and gentle", "LEFT"), "calm, gentle"))),
 ("r3", 6, f"Medium shot of {CHA} {YARD}, she walks in from the house and slowly places {CHEST} on the wooden table, "
           f"{SOLO}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, curious and suspicious, she lowers her sunglasses", "LEFT"), "curious, suspicious")),
 ("c11", D8("c11"), S("c11", "Isauro", f"Close-up of {ISA} {YARD0}, {IL}, he opens the red lacquered chest and takes out a folded document, calm", GER_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {ISA} {YARD}, {IL}, holding a folded document, calm", "RIGHT")),
 ("c12", 6, S("c12", "Germán", f"Close-up of {GER} {YARD0}, {GR}, nervous, he adjusts his glasses", ISA_B, "LEFT", "nervous, quick",
     f"Close-up of {GER} {YARD}, {GR}, nervous", "LEFT")),
 ("c13", 6, S("c13", "Isauro", f"Close-up of {ISA} {YARD0}, {IL}, serene, a small proud smile", GER_B, "RIGHT", "serene, proud, slow",
     f"Close-up of {ISA} {YARD}, {IL}, serene, a small proud smile", "RIGHT")),
 ("c14", 6, talk("c14", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, shocked and indignant, she takes off her sunglasses", "LEFT"), "indignant, shocked")),
 ("c15", 6, talk("c15", "Germán", one(f"Close-up of {GER} {YARD}, {GR}, cold and resentful, his jaw tight", "LEFT"), "resentful, cold")),
 ("c16", 6, talk("c16", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, calm, he raises one hand slowly", "RIGHT"), "calm, firm, slow")),
 ("c17", 6, (talk("c17", "Isauro", f"Medium wide group shot {YARD0}: {ISA} sitting on the LEFT at the head of the table with {CHA} standing behind him, {GER} and {ROC} standing on the RIGHT across the table; "
     f"Isauro speaks, closest to the camera and in sharp focus; only these four people, no extras. Only Isauro speaks: his lips move clearly; the other three stay silent with mouths closed.", "firm, moved, slow"),
   talk("c17", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, firm and moved", "RIGHT"), "firm, moved, slow"))),
 ("r4", 6, one(f"Close-up of {GER} {YARD}, {GR}, in silence, stunned, he slowly lowers the papers", "LEFT") + " Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Chabela", f"Close-up of {CHA} {YARD0}, {CL}, her eyes fill with light, stunned and moved, one hand on her chest", ISA_B, "LEFT", "stunned, moved, soft",
     f"Close-up of {CHA} {YARD}, {CL}, stunned and moved, one hand on her chest", "LEFT")),
 # CTA con carisma (después del BLACK): Isauro solo, a cámara
 ("c19", 10, talk("c19", "Isauro", f"Close-up from the chest up of {ISA} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small mischievous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Tú nomás eres la que limpia.", "Tú no eres de la familia."), ("Usted ya no sabe lo que hace, apá.", "Usted no puede hacer eso, apá."),
        ("slaps", "puts"), ("contemptuous", "cool"), ("stunned", "surprised"), ("shocked and indignant", "surprised"), ("resentful", "serious"),
        ("her eyes fill with light", "her eyes shine"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm midday light in the patio of a family lacquer workshop in Olinalá, Guerrero, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic patio with colorful lacquered boxes on a wooden table in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ISAURO_NAVA}", "a thin very old Mexican man with white combed-back hair, a thin white mustache and a light-beige shirt"),
         ("@{GERMAN_NAVA}", "a balding Mexican man in his forties with rectangular glasses, a mustache, a white shirt and a navy tie"),
         ("@{ROCIO_NAVA}", "a Mexican woman in her forties with caramel hair, sunglasses on her head and an emerald-green dress"),
         ("@{CHABELA_RUIZ}", "a Mexican woman around fifty with black hair with a grey streak in a bun, a lilac blouse and a white apron"),
         (" @{LOC_PATIOLACA}", "")]
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
