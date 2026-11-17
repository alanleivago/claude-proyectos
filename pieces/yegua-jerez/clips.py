"""Genera los clips de yegua-jerez PARTE 1 (La Yegua de Jerez, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Inspirado (transformado, no copiado) en la ref de @alisorxomrb 7706249552289860896 (fuentes/atrium-vista/videos/7706249552289860896_analisis.md): mujer sola defiende a un ex campeón
maltratado contra el capataz y el patrón; la corren; segunda pelea en casa; promesa; remate burlón del patrón. Aquí: Rosalba (26), escaramuza charra en un rancho de Jerez, Zacatecas,
defiende a la Duquesa, yegua campeona lastimada que el capataz Cutberto (35) quiere vender; el patrón Arnulfo (70) la corre con la yegua; la abuela Chayo (75) la regaña;
Rosalba promete ganar la charreada de Jerez; el patrón se burla.
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
# Geografía fija. Corral: Rosalba (arrodillada junto a la yegua) a la IZQUIERDA; Cutberto y Arnulfo a la DERECHA. Casa de la abuela: Rosalba IZQUIERDA con la yegua, Chayo DERECHA en la puerta.
YARD0 = ("in a horse ranch corral in Jerez, Zacatecas @{LOC_CORRALJEREZ} under a stormy grey sky: wooden fences, a dirt corral with straw, an old metal windmill, a hacienda gate with stone arches; "
         "no readable text, no signs, no logos, no brand logos on clothes")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOME0 = ("in the dirt yard of a small humble adobe house in Jerez, Zacatecas @{LOC_CASAABUELA} at dusk: a tiny wooden stable with straw, clay pots, a wooden door with a lantern, warm light; "
         "no readable text, no signs, no logos")
HOME = HOME0 + "; nobody else in the background, no extras, nobody besides the person described"
MARE = "@{DUQUESA} (an old thin chestnut mare with a white blaze and a white bandage on her front left leg)"
ROS = ("@{ROSALBA_ACUNA} (26-year-old Mexican woman, light-brown skin, long dark wavy hair in a low braid, a brown-and-cream checked long-sleeve shirt, jeans)")
CUT = ("@{CUTBERTO_LARA} (35-year-old Mexican man, light-brown skin, a thin black mustache, a black felt cowboy hat, a black leather vest over a white shirt, leather chaps)")
ARN = ("@{ARNULFO_VILLA} (70-year-old Mexican rancher, weathered light skin, a white mustache, a brown felt cowboy hat, a camel canvas work jacket)")
CHA = ("@{CHAYO_ACUNA} (75-year-old Mexican grandmother, small, brown wrinkled skin, grey hair in a bun, a purple checked apron over a beige blouse)")
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

# Bordes: Cutberto/Arnulfo/Chayo le hablan a Rosalba -> espalda de ella LEFT; Rosalba les habla -> espalda RIGHT.
ROS_B = "@{ROSALBA_ACUNA} seen from behind (long dark wavy hair in a low braid, brown-and-cream checked shirt)"
CUT_B = "@{CUTBERTO_LARA} seen from behind (black felt cowboy hat, black leather vest)"
ARN_B = "@{ARNULFO_VILLA} seen from behind (brown felt cowboy hat, camel canvas work jacket)"
CHA_B = "@{CHAYO_ACUNA} seen from behind (grey hair in a bun, purple checked apron strings)"
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

RK = f"kneeling on the LEFT in the dirt beside {MARE}, wrapping a bandage on the mare's leg"      # Rosalba en el corral
RS = f"standing on the LEFT beside {MARE}"                                                        # Rosalba de pie
CR = "standing on the RIGHT by the wooden fence, arms crossed"                                    # Cutberto
AR = "standing on the RIGHT in the corral"                                                        # Arnulfo
RH = f"standing on the LEFT in the yard holding the halter rope of {MARE}"                        # Rosalba en casa
HR = "standing on the RIGHT in the doorway of the adobe house"                                    # Chayo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Cutberto YA hablando y riéndose junto a la cerca; Rosalba arrodillada de espaldas (LEFT) junto a la yegua. La injusticia se ve en el frame 0.
 ("c01", D8("c01"), S("c01", "Cutberto", f"Medium close-up of {CUT} {YARD0}, {CR}, talking from the very first frame, mocking and laughing, the injured mare visible beside the kneeling woman", ROS_B, "LEFT", "mocking, cruel, arrogant",
     f"Medium close-up of {CUT} {YARD}, {CR}, talking from the very first frame, mocking and laughing", "LEFT")),
 ("c02", D8("c02"), S("c02", "Rosalba", f"Close-up of {ROS} {YARD0}, {RK}, she looks up, indignant and proud", CUT_B, "RIGHT", "indignant, proud, firm",
     f"Close-up of {ROS} {YARD}, {RK}, indignant and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Cutberto", one(f"Close-up of {CUT} {YARD}, {CR}, a mean smile, he tips his hat back", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {ARN} {YARD}, {AR}, already in place, he walks slowly closer from the porch, serious and annoyed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a brown cowboy hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Arnulfo", one(f"Close-up of {ARN} {YARD}, {AR}, annoyed, serious", "LEFT"), "annoyed, bossy")),
 ("c05", D8("c05"), talk("c05", "Cutberto", one(f"Close-up of {CUT} {YARD}, {CR}, he turns to the boss, accusing, pointing at the woman with his chin", "RIGHT"), "accusing, sly")),
 ("c06", D8("c06"), S("c06", "Arnulfo", f"Close-up of {ARN} {YARD0}, {AR}, offended and proud, he looks down at her", ROS_B, "LEFT", "offended, proud, mocking",
     f"Close-up of {ARN} {YARD}, {AR}, offended and proud", "LEFT")),
 ("c07", D8("c07"), S("c07", "Rosalba", f"Close-up of {ROS} {YARD0}, {RS}, she stands up, respectful but firm, her eyes shine", ARN_B, "RIGHT", "respectful, firm, emotional",
     f"Close-up of {ROS} {YARD}, {RS}, respectful but firm, her eyes shine", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Arnulfo", f"Close-up of {ARN} {YARD0}, {AR}, cold and final, he points at the gate", ROS_B, "LEFT", "cold, final, slow",
     f"Close-up of {ARN} {YARD}, {AR}, cold and final", "LEFT")),
 ("r2", 6, one(f"Close-up of {ROS} {YARD}, {RS}, in silence, tears in her eyes, she swallows and nods slowly with dignity", "RIGHT") + " Slow push-in. No dialogue."),
 ("i01", 6, f"Wide shot {YARD0}: {ROS} small in the frame, walking slowly out through the stone-arched hacienda gate, leading {MARE} that limps beside her, under the stormy sky; seen from far away, no other people. No dialogue."),
 ("c09", 6, talk("c09", "Cutberto", one(f"Close-up of {CUT} {YARD}, leaning on the gate post, waving goodbye with a mocking smile", "LEFT"), "mocking, cruel")),
 ("c10", 6, S("c10", "Chayo", f"Close-up of {CHA} {HOME0}, {HR}, surprised and worried, a hand on her cheek", ROS_B, "LEFT", "surprised, worried",
     f"Close-up of {CHA} {HOME}, {HR}, surprised and worried", "LEFT")),
 ("c11", D8("c11"), S("c11", "Rosalba", f"Close-up of {ROS} {HOME0}, {RH}, tired but proud, she strokes the mare's neck", CHA_B, "RIGHT", "tired, proud, honest",
     f"Close-up of {ROS} {HOME}, {RH}, tired but proud", "RIGHT")),
 ("c12", 6, talk("c12", "Chayo", one(f"Close-up of {CHA} {HOME}, {HR}, upset, scolding, she raises both hands", "LEFT"), "upset, scolding")),
 ("c13", D8("c13"), (talk("c13", "Rosalba", two(f"{ROS} on the LEFT holding the halter of {MARE} and {CHA} on the RIGHT in the doorway, facing each other in the yard {HOME0}, framed from the waist up; "
     f"Rosalba, determined, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rosalba", "Chayo"), "determined, brave, emotional"),
   talk("c13", "Rosalba", one(f"Close-up of {ROS} {HOME}, {RH}, determined", "RIGHT"), "determined, brave, emotional"))),
 ("c14", 6, talk("c14", "Chayo", one(f"Close-up of {CHA} {HOME}, {HR}, worried, she makes the sign of the cross", "LEFT"), "worried, resigned, soft")),
 ("r3", 6, f"Medium shot {HOME}: {ROS} inside the tiny wooden stable at night, gently brushing {MARE} by lantern light, tender and tired, the only person in the shot. Slow push-in. No dialogue."),
 ("i02", 6, f"Close-up insert {HOME0}: an old faded printed photo held in a woman's hand by lantern light, showing a young chestnut mare with a white blaze winning a charro competition with a smiling woman rider in a traditional escaramuza dress; only the hand and the photo, no readable text. No dialogue."),
 ("c15", D8("c15"), talk("c15", "Rosalba", f"Close-up of {ROS} inside the tiny wooden stable at night by lantern light {HOME}, holding an old photo next to the head of {MARE}, she speaks softly to the mare, "
     f"tender, a small smile through tears; the only person in the shot; {ONE}.", "tender, soft, determined")),
 ("c16", D8("c16"), talk("c16", "Cutberto", one(f"Close-up of {CUT} sitting at a wooden table on the covered porch of the ranch {YARD}, gossiping, amused", "RIGHT"), "amused, gossiping")),
 ("c17", 6, talk("c17", "Arnulfo", one(f"Close-up of {ARN} sitting at a wooden table on the covered porch of the ranch {YARD}, he laughs out loud, mocking", "LEFT"), "mocking, laughing")),
 # CTA con carisma (después del BLACK): Rosalba sola, a cámara
 ("c18", 10, talk("c18", "Rosalba", f"Close-up from the chest up of {ROS} {HOME}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves her braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small brave half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Ella no es un trapo para tirarlo.", "Ella merece respeto."), ("la hicieron saltar lastimada", "la hicieron correr cansada"),
        ("Esa yegua ya no sirve ni para jalar carreta, Rosalba.", "Esa yegua ya está muy vieja, Rosalba."),
        ("limps", "walks slowly"), ("injured mare", "tired mare"), ("a mean smile", "a smile"), ("cruel", "cold"), ("tears in her eyes", "her eyes shine"),
        ("small through tears", "small"), ("offended", "surprised"),
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
          "Vertical scene from a Mexican TV drama, realistic, stormy light on a horse ranch in Zacatecas, 85mm lens, slow push-in. Characters and the horse look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rural horse ranch and humble adobe house in northern Mexico, steady camera. Same faces, clothes and horse as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSALBA_ACUNA}", "a Mexican woman in her twenties with a long dark braid and a brown-and-cream checked shirt"),
         ("@{CUTBERTO_LARA}", "a Mexican man in his thirties with a thin mustache, a black cowboy hat and a black leather vest"),
         ("@{ARNULFO_VILLA}", "an elderly Mexican rancher with a white mustache, a brown felt cowboy hat and a camel work jacket"),
         ("@{CHAYO_ACUNA}", "a small elderly Mexican woman with grey hair in a bun and a purple checked apron"),
         ("@{DUQUESA}", "an old thin chestnut mare with a white blaze"),
         (" @{LOC_CORRALJEREZ}", ""), (" @{LOC_CASAABUELA}", "")]
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
