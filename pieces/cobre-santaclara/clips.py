"""Genera los clips de cobre-santaclara PARTE 1 (El Cobre de Santa Clara, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> giro familiar): en Santa Clara del Cobre, Michoacán, Gerardo (32), dueño de una fábrica,
le tira a doña Celestina (64) el cazo de cobre de un encargo y le da plazo "antes de que empiece la feria"; llega don Lázaro (60), poderoso de la región, por el cazo de la boda de su hija:
Gerardo es el novio. Plazo invertido y boda cancelada. Giro: viene un nieto en camino... y Gerardo ya tiene otra familia en Morelia.
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
# Geografía fija (taller de cobre): Celestina y Fausto a la IZQUIERDA (yunque y fragua); Gerardo y Lázaro a la DERECHA, en la entrada abierta a la plaza.
YARD0 = ("in a hammered-copper workshop in Santa Clara del Cobre, Michoacán @{LOC_TALLERCOBRE} in the afternoon: wooden shelves full of shiny hammered copper pots, a big iron anvil, "
         "a small forge with orange glow, a stone floor, white arcades of the plaza outside, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CAZO = "a big shiny hammered copper pot"
CEL = ("@{CELESTINA_PATINO} (64-year-old Mexican woman, brown skin, grey hair in two long braids, a dark leather work apron over a royal-blue blouse)")
FAU = ("@{FAUSTO_PATINO} (35-year-old Mexican man, thin and wiry, brown skin, short black hair, a thin black mustache, a black t-shirt, a dark leather work apron)")
GER = ("@{GERARDO_MALDONADO} (32-year-old Mexican man, light skin, styled curly dark-brown hair, clean-shaven, a beige suede jacket over a white t-shirt, a rose-gold watch, slim tinted glasses)")
LAZ = ("@{LAZARO_IBARRA} (60-year-old Mexican man, broad and heavy, dark-brown skin, short grey hair, a grey felt cowboy hat, a black leather jacket over a dark-red shirt)")
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

# Bordes: Gerardo o Lázaro le hablan a Celestina/Fausto -> espalda LEFT; Celestina o Fausto les hablan -> espalda RIGHT.
CEL_B = "@{CELESTINA_PATINO} seen from behind (grey hair in two long braids, the straps of a leather apron over a royal-blue blouse)"
FAU_B = "@{FAUSTO_PATINO} seen from behind (short black hair, black t-shirt, thin)"
GER_B = "@{GERARDO_MALDONADO} seen from behind (styled curly dark-brown hair, beige suede jacket)"
LAZ_B = "@{LAZARO_IBARRA} seen from behind (grey felt cowboy hat, black leather jacket, broad shoulders)"
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

CL = "standing on the LEFT at the iron anvil, holding a small hammer"            # Celestina
CS = "standing on the LEFT beside the iron anvil"                                # Celestina sin martillo
FL = "standing on the LEFT beside the glowing forge"                             # Fausto
GR = "standing on the RIGHT in the open entrance of the workshop"                # Gerardo
LR = "standing on the RIGHT in the open entrance of the workshop, the plaza behind him"  # Lázaro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Gerardo YA hablando en la entrada del taller; Celestina de espaldas (LEFT) en el yunque. Plazo: antes de que empiece la feria.
 ("c01", D8("c01"), S("c01", "Gerardo", f"Medium close-up of {GER} {YARD0}, {GR}, talking from the very first frame, arrogant, he looks around the workshop with disdain", CEL_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {GER} {YARD}, {GR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Celestina", f"Close-up of {CEL} {YARD0}, {CL}, she stops hammering, firm and proud", GER_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {CEL} {YARD}, {CL}, firm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, a mocking smile, he adjusts his tinted glasses", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {FAU} {YARD}, {FL}, already in place, he puts down a pair of tongs and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black t-shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Fausto", f"Close-up of {FAU} {YARD0}, {FL}, firm, protective", GER_B, "RIGHT", "firm, protective",
     f"Close-up of {FAU} {YARD}, {FL}, firm, protective", "RIGHT")),
 ("c05", 6, S("c05", "Gerardo", f"Close-up of {GER} {YARD0}, {GR}, he laughs once with contempt", FAU_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {GER} {YARD}, {GR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a white sneaker slowly pushes {CAZO} off a low wooden stand and it rolls and stops on the stone floor with a dent; only the shoe and the copper pot, no face. No dialogue."),
 ("c06", 6, S("c06", "Celestina", f"Close-up of {CEL} {YARD0}, {CS}, her eyes shine, she gestures down at the dented copper pot, indignant", GER_B, "RIGHT", "hurt, indignant",
     f"Close-up of {CEL} {YARD}, {CS}, her eyes shine, indignant", "RIGHT")),
 ("c07", 6, talk("c07", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {CEL} {YARD}, {CS}, she slowly kneels and lifts the dented copper pot into her arms, her eyes shine, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly and stopping in a colonial plaza with white arcades and a kiosk in Santa Clara del Cobre, Michoacán, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {LAZ} {YARD}, {LR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey cowboy hat')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Lázaro", f"Close-up of {LAZ} {YARD0}, {LR}, polite and warm, he touches the brim of his hat", CEL_B, "LEFT", "polite, warm, calm",
     f"Close-up of {LAZ} {YARD}, {LR}, polite and warm", "LEFT")),
 ("c09", 6, S("c09", "Celestina", f"Close-up of {CEL} {YARD0}, {CS}, holding the dented copper pot, ashamed and sad", LAZ_B, "RIGHT", "sad, humble",
     f"Close-up of {CEL} {YARD}, {CS}, holding the dented copper pot, sad", "RIGHT")),
 ("c10", 6, talk("c10", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, he turns around, his smile gone, pale and nervous", "RIGHT"), "surprised, nervous")),
 ("c11", 6, talk("c11", "Lázaro", one(f"Close-up of {LAZ} {YARD}, {LR}, cold and serious, he looks at the young man", "LEFT"), "cold, serious, slow")),
 ("c12", 6, talk("c12", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, nervous, a forced smile, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c13", 6, S("c13", "Celestina", f"Close-up of {CEL} {YARD0}, {CS}, calm and firm", LAZ_B, "RIGHT", "calm, firm",
     f"Close-up of {CEL} {YARD}, {CS}, calm and firm", "RIGHT")),
 ("c14", D8("c14"), talk("c14", "Lázaro", one(f"Close-up of {LAZ} {YARD}, {LR}, cold and final, he points slowly toward the plaza", "LEFT"), "cold, final, slow")),
 ("c15", D8("c15"), talk("c15", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, a crooked smile returns, confident again", "RIGHT"), "sly, confident")),
 ("r4", 6, one(f"Close-up of {LAZ} {YARD}, {LR}, in silence, his eyes narrow, a shadow of doubt crosses his face", "LEFT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Lázaro", one(f"Close-up of {LAZ} {YARD}, {LR}, low and dangerous, very serious", "LEFT"), "low, serious, slow")),
 ("c17", 6, talk("c17", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, a smug smile, he spreads his hands", "RIGHT"), "smug, slow")),
 ("c18", D8("c18"), (talk("c18", "Celestina", two(f"{CEL} on the LEFT holding the dented copper pot and {LAZ} on the RIGHT, in profile facing each other in the workshop entrance {YARD0}, "
     f"framed from the waist up; Celestina steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Celestina", "Lázaro"), "low, serious, firm"),
   talk("c18", "Celestina", one(f"Close-up of {CEL} {YARD}, {CS}, low and serious", "RIGHT"), "low, serious, firm"))),
 # CTA con carisma (después del BLACK): Lázaro solo, a cámara
 ("c19", 10, talk("c19", "Lázaro", f"Close-up from the chest up of {LAZ} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his grey felt hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small dangerous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Que viene en camino un nieto suyo, suegro.", "Que su hija y yo vamos a tener familia, suegro."), ("¿Qué estás insinuando?", "¿Qué quieres decir?"),
        ("Pero este joven me lo tiró al suelo.", "Pero este joven lo maltrató."), ("pushes", "moves"), ("with a dent", "on its side"), ("dented", "fallen"),
        ("low and dangerous", "low"), ("dangerous", "serious"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("powerful", "serious"), ("crooked", "small"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a hammered-copper workshop on a colonial plaza in Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic copper workshop with shelves of shiny copper pots in a Mexican town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CELESTINA_PATINO}", "a Mexican woman in her sixties with grey hair in two braids, a leather apron and a royal-blue blouse"),
         ("@{FAUSTO_PATINO}", "a thin Mexican man in his thirties with a thin mustache, a black t-shirt and a leather apron"),
         ("@{GERARDO_MALDONADO}", "a light-skinned Mexican man in his thirties with curly dark hair, tinted glasses and a beige suede jacket"),
         ("@{LAZARO_IBARRA}", "a broad Mexican man in his sixties with a grey felt cowboy hat and a black leather jacket"),
         (" @{LOC_TALLERCOBRE}", "")]
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
