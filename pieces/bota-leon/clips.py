"""Genera los clips de bota-leon PARTE 1 (La Bota de León, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> el salvador también es amenaza): en un taller de botas de León, Guanajuato, Óscar (40),
dueño de una curtiduría, le corta el cuero a Leticia (32) y le da plazo "antes de que acabe la feria" para quedarse con los moldes de su difunto padre; le tira unas botas de encargo.
Llega el dueño del encargo, don Rodrigo (68), que levantó la curtiduría de Óscar: plazo invertido. Giro: el taller siempre estuvo a nombre de Rodrigo, y ahora viene por los moldes.
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
# Geografía fija (taller): Leticia y don Ramón a la IZQUIERDA (mesas de trabajo); Óscar y Rodrigo a la DERECHA (Rodrigo entra por la puerta a la calle).
YARD0 = ("inside a traditional boot workshop in León, Guanajuato @{LOC_TALLERBOTAS} in the afternoon: long wooden workbenches with pieces of brown leather, wooden shoe lasts, "
         "shelves full of handmade cowboy boots, tanned hides on the wall, an open door to a colonial street, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
BOOTS = "a pair of new handmade brown cowboy boots"
LET = ("@{LETICIA_TADEO} (32-year-old Mexican woman, light-brown skin, dark curly hair in a low bun, small gold hoop earrings, a black t-shirt, a brown leather work apron)")
RAM = ("@{RAMON_ESTRADA} (70-year-old Mexican man, bald on top with a white fringe of hair, thick black-rimmed glasses, a white mustache, a grey work shirt, a worn dark leather apron)")
OSC = ("@{OSCAR_RENTERIA} (40-year-old Mexican man, tall, light skin, slicked-back dark-blond hair, clean-shaven, a cognac leather jacket over a black t-shirt, a gold watch)")
ROD = ("@{RODRIGO_BARCENAS} (68-year-old elegant Mexican man, light-brown skin, silver hair, a thick silver mustache, a cream felt cowboy hat, a grey wool suit with a black bolo tie)")
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

# Bordes: Óscar o Rodrigo le hablan a Leticia/Ramón -> espalda LEFT; Leticia o Ramón les hablan -> espalda RIGHT.
LET_B = "@{LETICIA_TADEO} seen from behind (dark curly hair in a low bun, black t-shirt, the strings of a brown leather apron)"
RAM_B = "@{RAMON_ESTRADA} seen from behind (bald head with a white fringe of hair, grey work shirt)"
OSC_B = "@{OSCAR_RENTERIA} seen from behind (slicked-back dark-blond hair, cognac leather jacket, tall)"
ROD_B = "@{RODRIGO_BARCENAS} seen from behind (cream felt cowboy hat, grey wool suit jacket)"
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

LL = "standing on the LEFT behind a wooden workbench with pieces of leather"     # Leticia
RL = "sitting on the LEFT at a back workbench with a hammer and a shoe last"     # Ramón
RS = "standing on the LEFT beside a back workbench"                              # Ramón de pie
OR = "standing on the RIGHT, leaning on the end of the workbench"                # Óscar
DR = "standing on the RIGHT just inside the open door to the street"             # Rodrigo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Óscar YA hablando, recargado en la mesa con una bota en la mano; Leticia de espaldas (LEFT). Plazo: antes de que acabe la feria.
 ("c01", D8("c01"), S("c01", "Óscar", f"Medium close-up of {OSC} {YARD0}, {OR}, talking from the very first frame, arrogant, turning a leather boot in his hand with disdain", LET_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {OSC} {YARD}, {OR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, firm and proud, she puts both hands flat on the bench", OSC_B, "RIGHT", "firm, proud",
     f"Close-up of {LET} {YARD}, {LL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, a cold smile, he tilts his head", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {RAM} {YARD}, {RL}, already in place hammering a sole, he stops, lowers the hammer and looks up over his glasses, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in glasses')}. Slow push-in. No dialogue."),
 ("c04", D8("c04"), S("c04", "Ramón", f"Close-up of {RAM} {YARD0}, {RS}, calm and firm, he takes off his glasses", OSC_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {RAM} {YARD}, {RS}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Óscar", f"Close-up of {OSC} {YARD0}, {OR}, he laughs once with contempt", RAM_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {OSC} {YARD}, {OR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold watch slowly pushes {BOOTS} off the edge of the wooden workbench and they fall onto the dusty floor; only the hand, the bench and the boots, no face. No dialogue."),
 ("c06", 6, S("c06", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, her eyes shine, indignant, she gestures down at the boots on the floor", OSC_B, "RIGHT", "hurt, indignant",
     f"Close-up of {LET} {YARD}, {LL}, her eyes shine, indignant", "RIGHT")),
 ("c07", 6, talk("c07", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("i02", 6, "Wide shot of two black SUVs stopping slowly in a narrow colonial street with colorful facades in León, Guanajuato, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {ROD} {YARD}, {DR}, already standing in place, he slowly takes off dark sunglasses, elegant, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream cowboy hat')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Rodrigo", f"Close-up of {ROD} {YARD0}, {DR}, polite and warm, he touches the brim of his hat", LET_B, "LEFT", "polite, warm, calm",
     f"Close-up of {ROD} {YARD}, {DR}, polite and warm", "LEFT")),
 ("c09", 6, S("c09", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, holding {BOOTS} against her chest, ashamed and sad", ROD_B, "RIGHT", "sad, humble",
     f"Close-up of {LET} {YARD}, {LL}, holding {BOOTS}, sad", "RIGHT")),
 ("c10", 6, talk("c10", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, he turns around, his smile gone, pale and nervous", "RIGHT"), "surprised, nervous")),
 ("c11", D8("c11"), talk("c11", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, cold and serious, he looks at the younger man", "LEFT"), "cold, serious, slow")),
 ("c12", 6, talk("c12", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, nervous, a forced smile, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c13", D8("c13"), talk("c13", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, he points slowly at the boots, cold and final", "LEFT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {OSC} {YARD}, kneeling on the dusty floor of the workshop, he wipes a brown cowboy boot with a cloth, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a cognac leather jacket')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, grateful, a small relieved smile", ROD_B, "RIGHT", "grateful, warm",
     f"Close-up of {LET} {YARD}, {LL}, grateful, a small relieved smile", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Rodrigo", f"Close-up of {ROD} {YARD0}, {DR}, his smile fades slowly, his eyes become cold", LET_B, "LEFT", "calm, cold, slow",
     f"Close-up of {ROD} {YARD}, {DR}, his smile fades, his eyes become cold", "LEFT")),
 ("c16", 6, talk("c16", "Leticia", one(f"Close-up of {LET} {YARD}, {LL}, confused, worried", "RIGHT"), "confused, worried")),
 ("c17", 6, talk("c17", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, calm and cold, completely sure", "LEFT"), "calm, cold, slow")),
 ("r4", 6, one(f"Close-up of {RAM} {YARD}, {RS}, in silence, he slowly lowers his eyes and takes off his glasses, ashamed", "RIGHT") + " Slow push-in. No dialogue."),
 ("c18", 6, (talk("c18", "Ramón", two(f"{RAM} on the LEFT and {LET} on the RIGHT, in profile facing each other beside the workbench {YARD0}, framed from the waist up; "
     f"Ramón, sad and honest, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ramón", "Leticia"), "sad, honest, low"),
   talk("c18", "Ramón", one(f"Close-up of {RAM} {YARD}, {RS}, sad and honest", "RIGHT"), "sad, honest, low"))),
 ("c19", 6, talk("c19", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, he looks around the workshop slowly, a small cold smile", "LEFT"), "cold, calm, slow")),
 # CTA con carisma (después del BLACK): Leticia sola, a cámara
 ("c20", 10, talk("c20", "Leticia", f"Close-up from the chest up of {LET} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a curl behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small defiant half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Que se las lleve la basura.", "Que se las lleve otro."), ("¿Y así me pagas, tirando mis botas?", "¿Y así tratas mis botas?"),
        ("Pero el señor las tiró al suelo.", "Pero el señor las maltrató."), ("pushes", "moves"), ("fall onto the dusty floor", "rest on the floor"),
        ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("his eyes become cold", "he becomes serious"), ("powerful", "serious"),
        ("defiant", "brave"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a traditional boot workshop in León, Guanajuato, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic workshop with leather and handmade cowboy boots in central Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LETICIA_TADEO}", "a Mexican woman in her thirties with dark curly hair in a bun, a black t-shirt and a brown leather apron"),
         ("@{RAMON_ESTRADA}", "an elderly bald Mexican man with thick glasses, a white mustache and a grey work shirt"),
         ("@{OSCAR_RENTERIA}", "a tall Mexican man in his forties with slicked-back dark-blond hair and a cognac leather jacket"),
         ("@{RODRIGO_BARCENAS}", "an elegant elderly Mexican man with a silver mustache, a cream cowboy hat and a grey suit with a bolo tie"),
         (" @{LOC_TALLERBOTAS}", "")]
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
