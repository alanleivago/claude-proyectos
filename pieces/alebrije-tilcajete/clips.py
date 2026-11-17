"""Genera los clips de alebrije-tilcajete PARTE 1 (El Alebrije de Tilcajete, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos + padre-hijos (humillación + plazo -> llega el jefe poderoso -> el jefe es el hijo -> el traidor es él mismo): en San Martín Tilcajete, Oaxaca, la licenciada Paulina (40) quiere el terreno
del tallador don Crispín (68) para un hotel, le rompe un alebrije y da plazo "antes de que acabe la Guelaguetza". Llama a su jefe: llega Ezequiel (42), el hijo que se fue hace veinte años.
Giro: fue el propio Ezequiel quien la mandó a apretar "al viejo terco".
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
# Geografía fija (patio del taller): Crispín SIEMPRE a la IZQUIERDA en su mesa de tallar; Paulina y Ezequiel a la DERECHA (Ezequiel llega por el camino de tierra).
YARD0 = ("in the patio of a family alebrije workshop in San Martín Tilcajete, Oaxaca @{LOC_TALLERALEBRIJE} in the afternoon: wooden tables full of colorful painted fantastical wooden animal figures, "
         "small paint pots, adobe walls with pink bougainvillea, agave plants and dry hills beyond, warm sunlight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ALE = "a colorful painted wooden figure of a fantastical winged jaguar"
PHONE = "a smartphone"
CRI = ("@{CRISPIN_MENDOZA} (68-year-old Zapotec Mexican man, brown skin, short grey hair, grey stubble, round wire glasses, a white cotton shirt, a brown work apron with wood shavings)")
PAU = ("@{PAULINA_ARRIAGA} (40-year-old Mexican businesswoman, light skin, a sleek black bob haircut, red lipstick, a red blazer over a white blouse)")
EZE = ("@{EZEQUIEL_MENDOZA} (42-year-old Mexican man, brown skin, short black slicked-back hair, a short black beard, a black dress shirt under a black blazer, a gold watch)")
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

# Bordes: Paulina o Ezequiel le hablan a Crispín -> espalda de él LEFT; Crispín les habla -> espalda RIGHT.
CRI_B = "@{CRISPIN_MENDOZA} seen from behind (short grey hair, white cotton shirt, the strings of a brown apron)"
PAU_B = "@{PAULINA_ARRIAGA} seen from behind (sleek black bob haircut, red blazer)"
EZE_B = "@{EZEQUIEL_MENDOZA} seen from behind (short black slicked-back hair, black blazer)"
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

CL = "standing on the LEFT behind a wooden table of painted alebrijes"            # Crispín
PR = "standing on the RIGHT in the patio, holding a black leather folder"          # Paulina
ER = "standing on the RIGHT in the patio"                                          # Ezequiel

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Paulina YA hablando, le extiende la carpeta; Crispín de espaldas (LEFT). Plazo: antes de que acabe la Guelaguetza.
 ("c01", D8("c01"), S("c01", "Paulina", f"Medium close-up of {PAU} {YARD0}, {PR}, talking from the very first frame, impatient and arrogant, she holds out the open folder and a pen", CRI_B, "LEFT", "impatient, arrogant, cold",
     f"Medium close-up of {PAU} {YARD}, {PR}, talking from the very first frame, impatient and arrogant", "LEFT")),
 ("c02", 6, S("c02", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, calm and proud, he keeps holding a small carving knife over a piece of wood", PAU_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {CRI} {YARD}, {CL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, a cold little laugh, she looks at the figures with disdain", "LEFT"), "mocking, cold")),
 ("i01", 6, f"Close-up insert {YARD0}: the corner of a black leather folder slowly pushes {ALE} off the edge of a wooden table and it lands on the dusty ground with one wing broken off; only the folder, the table and the figure, no face. No dialogue."),
 ("c04", 6, S("c04", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, his eyes shine behind his glasses, indignant but calm", PAU_B, "RIGHT", "hurt, firm",
     f"Close-up of {CRI} {YARD}, {CL}, his eyes shine, indignant", "RIGHT")),
 ("c05", 6, talk("c05", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, she shrugs, mocking", "LEFT"), "mocking, cruel")),
 ("r1", 6, f"Medium shot of {CRI} {YARD}, he slowly kneels and picks up {ALE} and its broken wing from the ground, his eyes shine, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a white shirt')}. Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, holding {PHONE} to her ear, impatient, she rolls her eyes", "LEFT"), "impatient, annoyed")),
 ("i02", 6, "Wide shot of two black SUVs driving slowly along a dusty dirt road between agave fields and dry hills in Oaxaca, warm afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {EZE} {YARD}, {ER}, already standing in place, a black SUV parked behind him, he takes off dark sunglasses, confident and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black blazer')}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, a polite smile for her boss, she gestures toward the old man", "RIGHT"), "polite, mocking")),
 ("c08", 6, S("c08", "Ezequiel", f"Close-up of {EZE} {YARD0}, {ER}, he freezes, stunned, his confident face falls", CRI_B, "LEFT", "stunned, low, small",
     f"Close-up of {EZE} {YARD}, {ER}, stunned, his face falls", "LEFT")),
 ("c09", D8("c09"), S("c09", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, holding the broken figure, sad and dignified", EZE_B, "RIGHT", "sad, dignified, slow",
     f"Close-up of {CRI} {YARD}, {CL}, holding the broken figure, sad and dignified", "RIGHT")),
 ("c10", 6, talk("c10", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, surprised, her smile disappears", "RIGHT"), "surprised, nervous")),
 ("c11", 6, talk("c11", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {ER}, cold and furious but controlled, he looks at her", "RIGHT"), "cold, firm, slow")),
 ("c12", 6, talk("c12", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, a slow defiant smile returns", "RIGHT"), "defiant, sly")),
 ("c13", D8("c13"), (talk("c13", "Paulina", two(f"{PAU} on the LEFT and {EZE} on the RIGHT, in profile facing each other in the patio {YARD0}, framed from the waist up; "
     f"Paulina, sly and calm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Paulina", "Ezequiel"), "sly, calm, slow"),
   talk("c13", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, sly and calm", "RIGHT"), "sly, calm, slow"))),
 ("r3", 6, one(f"Close-up of {CRI} {YARD}, {CL}, in silence, he slowly raises his eyes to his son, deeply hurt", "RIGHT") + " Slow push-in. No dialogue."),
 ("c14", D8("c14"), S("c14", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, hurt, his voice low", EZE_B, "RIGHT", "hurt, low, slow",
     f"Close-up of {CRI} {YARD}, {CL}, hurt, his voice low", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Ezequiel", f"Close-up of {EZE} {YARD0}, {ER}, ashamed, he cannot hold his father's eyes", CRI_B, "LEFT", "ashamed, quick, low",
     f"Close-up of {EZE} {YARD}, {ER}, ashamed", "LEFT")),
 ("c16", 6, talk("c16", "Crispín", one(f"Close-up of {CRI} {YARD}, {CL}, calm, sad, he takes off his glasses", "RIGHT"), "calm, sad, slow")),
 ("c17", 6, talk("c17", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {ER}, pleading, he opens his hands", "LEFT"), "pleading, quick")),
 ("c18", 6, S("c18", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, firm and calm, holding the broken alebrije", EZE_B, "RIGHT", "firm, calm, final",
     f"Close-up of {CRI} {YARD}, {CL}, firm and calm", "RIGHT")),
 # CTA con carisma (después del BLACK): Crispín solo, a cámara
 ("c19", 10, talk("c19", "Crispín", f"Close-up from the chest up of {CRI} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts his round glasses, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Usted me dijo: el viejo es terco, apriétalo hasta que firme.", "Usted me dijo: el señor es terco, insiste hasta que firme."),
        ("Pobre es el que vende a su padre.", "Pobre es el que olvida a su padre."), ("Al cabo se la pasa agachado todo el día.", "Usted sabe hacerlo mejor."),
        ("with one wing broken off", "on its side"), ("broken", "small"), ("pushes", "moves"), ("cold and furious but controlled", "serious"), ("stunned", "surprised"),
        ("deeply hurt", "sad"), ("powerful", "serious"), ("defiant", "calm"), ("carving knife", "carving tool"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon sun in the patio of an alebrije workshop in Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic workshop patio with colorful painted wooden figures in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CRISPIN_MENDOZA}", "an elderly indigenous Mexican man with short grey hair, round wire glasses, a white shirt and a brown apron"),
         ("@{PAULINA_ARRIAGA}", "a Mexican businesswoman in her forties with a sleek black bob and a red blazer"),
         ("@{EZEQUIEL_MENDOZA}", "a Mexican man in his forties with a short black beard, slicked-back hair and a black blazer"),
         (" @{LOC_TALLERALEBRIJE}", "")]
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
