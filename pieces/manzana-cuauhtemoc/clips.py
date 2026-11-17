"""Genera los clips de manzana-cuauhtemoc PARTE 1 (La Manzana de Cuauhtémoc, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> giro familiar): en una huerta de Cuauhtémoc, Chihuahua, Kevin (34) le tira la cosecha
a doña Herminia (68) y le da plazo "antes de que caiga la helada" para quedarse con la huerta; ella llama a Anselmo (65), al que escondió en su sótano en una nevada hace treinta años,
y resulta que es el padrino de Kevin. Giro: Joel (29), el nieto de Herminia, es hijo de Anselmo (con Rebeca, la hija de Herminia).
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
# Geografía fija (patio de empaque de la huerta): a la IZQUIERDA Herminia y Joel junto a las cajas de manzanas; a la DERECHA Kevin recargado en su camioneta;
# Anselmo llega desde r4 por la DERECHA, por el camino de tierra.
YARD0 = ("in the packing yard of an apple orchard in Cuauhtémoc, Chihuahua @{LOC_HUERTACUAUH} in the late autumn afternoon: rows of apple trees with red apples, stacked wooden apple crates, "
         "a small weathered wooden packing shed, a dirt road, dry golden grass, pale cold light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CRATES = "stacked wooden crates of red apples"
PHONE = "an old small flip phone"
HER = ("@{HERMINIA_OCHOA} (68-year-old Mexican woman, small and thin, wrinkled light-brown skin, white hair in a low bun, a maroon knitted wool cardigan over a dark floral blouse, "
       "a long dark-brown skirt)")
JOE = ("@{JOEL_OCHOA} (29-year-old Mexican man, tall and thin, light brown skin, short black hair, a short black beard, a red-and-black plaid flannel shirt under a tan canvas work jacket)")
KEV = ("@{KEVIN_LOERA} (34-year-old Mexican man, light skin, slicked-back black hair, a thin black mustache, a shiny black puffer jacket open over a burgundy button-up shirt, a silver watch)")
ANS = ("@{ANSELMO_QUINONES} (65-year-old Mexican man, tall and broad, light skin, grey hair, a grey goatee, a black felt cowboy hat, a long dark-brown sheepskin coat)")
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

# Bordes: Kevin o Anselmo le hablan a Herminia/Joel -> espalda LEFT; Herminia o Joel le hablan a Kevin/Anselmo -> espalda RIGHT.
HER_B = "@{HERMINIA_OCHOA} seen from behind (white hair in a low bun, maroon knitted wool cardigan, small)"
JOE_B = "@{JOEL_OCHOA} seen from behind (short black hair, tan canvas work jacket, tall and thin)"
KEV_B = "@{KEVIN_LOERA} seen from behind (slicked-back black hair, shiny black puffer jacket)"
ANS_B = "@{ANSELMO_QUINONES} seen from behind (black felt cowboy hat, long dark-brown sheepskin coat, broad shoulders)"
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

HL = f"standing on the LEFT beside {CRATES}"                                   # Herminia
JL = f"standing on the LEFT beside {CRATES}"                                   # Joel
KR = "standing on the RIGHT, leaning on a black pickup truck"                  # Kevin
AR = "standing on the RIGHT on the dirt road"                                  # Anselmo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Kevin YA hablando, le extiende un papel; Herminia de espaldas (LEFT). Plazo: antes de que caiga la helada.
 ("c01", D8("c01"), S("c01", "Kevin", f"Medium close-up of {KEV} {YARD0}, {KR}, talking from the very first frame, arrogant, he holds out a sheet of paper and a pen", HER_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {KEV} {YARD}, {KR}, talking from the very first frame, arrogant, holding a sheet of paper", "LEFT")),
 ("c02", D8("c02"), S("c02", "Herminia", f"Close-up of {HER} {YARD0}, {HL}, firm and proud, she pushes the paper away with one hand", KEV_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {HER} {YARD}, {HL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, a cocky smile, he tilts his head", "LEFT"), "cocky, mocking, calm")),
 ("r1", 6, f"Medium shot of {JOE} {YARD}, {JL}, already in place holding an apple crate, he sets it down and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a plaid flannel shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Joel", f"Close-up of {JOE} {YARD0}, {JL}, firm, protective", KEV_B, "RIGHT", "firm, protective",
     f"Close-up of {JOE} {YARD}, {JL}, firm, protective", "RIGHT")),
 ("c05", 6, S("c05", "Kevin", f"Close-up of {KEV} {YARD0}, {KR}, he laughs once with contempt", JOE_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {KEV} {YARD}, {KR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a pointed black boot slowly tips over a wooden crate of red apples and the apples roll across the dry dirt; only the boot, the crate and the apples, no face. No dialogue."),
 ("c06", 6, S("c06", "Herminia", f"Close-up of {HER} {YARD0}, {HL}, indignant, her eyes shine, she gestures down at the apples", KEV_B, "RIGHT", "indignant, hurt",
     f"Close-up of {HER} {YARD}, {HL}, indignant, her eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, laughing, he spreads his arms", "LEFT"), "mocking, cruel")),
 ("r2", 6, one(f"Close-up of {HER} {YARD}, {HL}, in silence, her jaw tight, her eyes shine, she looks down at the apples on the ground", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), talk("c08", "Herminia", one(f"Close-up of {HER} {YARD}, {HL}, quiet and serious, a memory in her eyes", "RIGHT"), "quiet, serious, slow")),
 ("c09", 6, S("c09", "Kevin", f"Close-up of {KEV} {YARD0}, {KR}, mocking, he shakes his head", HER_B, "LEFT", "mocking, amused",
     f"Close-up of {KEV} {YARD}, {KR}, mocking", "LEFT")),
 ("r3", 6, f"Medium shot of {HER} {YARD}, {HL}, she takes {PHONE} out of her cardigan pocket, opens it and slowly presses a number with her thumb, calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Herminia", one(f"Close-up of {HER} {YARD}, {HL}, holding {PHONE} to her ear, calm and serious", "RIGHT"), "calm, serious, low")),
 ("i02", 6, "Wide shot of three dark pickup trucks driving slowly in a line along a dirt road between rows of apple trees in Chihuahua at sunset, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r4", 6, f"Medium shot of {ANS} {YARD}, {AR}, already standing in place, a dark pickup truck parked behind him, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black cowboy hat')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Anselmo", f"Close-up of {ANS} {YARD0}, {AR}, respectful and moved, he touches the brim of his hat", HER_B, "LEFT", "respectful, warm, moved",
     f"Close-up of {ANS} {YARD}, {AR}, respectful and moved, he touches the brim of his hat", "LEFT")),
 ("c12", D8("c12"), S("c12", "Herminia", f"Close-up of {HER} {YARD0}, {HL}, tired and firm", ANS_B, "RIGHT", "tired, firm",
     f"Close-up of {HER} {YARD}, {HL}, tired and firm", "RIGHT")),
 ("c13", 6, talk("c13", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, his smile gone, pale and surprised", "RIGHT"), "surprised, nervous")),
 ("c14", 6, talk("c14", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, cold and serious, he looks at his godson", "LEFT"), "cold, serious, slow")),
 ("c15", 6, talk("c15", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, nervous, a forced smile, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c16", D8("c16"), talk("c16", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, he gestures slowly toward the apples on the ground, cold and final", "LEFT"), "cold, final, slow")),
 ("r5", 6, f"Medium shot of {KEV} {YARD}, kneeling on the dry dirt, he picks up red apples one by one and puts them back into a wooden crate, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black puffer jacket')}. No dialogue."),
 ("c17", 6, S("c17", "Joel", f"Close-up of {JOE} {YARD0}, {JL}, grateful and respectful, a small nod", ANS_B, "RIGHT", "grateful, respectful",
     f"Close-up of {JOE} {YARD}, {JL}, grateful, a small nod", "RIGHT")),
 ("c18", 6, S("c18", "Anselmo", f"Close-up of {ANS} {YARD0}, {AR}, he looks at the young man carefully, curious, his eyes narrow", JOE_B, "LEFT", "curious, slow, thoughtful",
     f"Close-up of {ANS} {YARD}, {AR}, curious, his eyes narrow", "LEFT")),
 ("c19", 6, talk("c19", "Joel", one(f"Close-up of {JOE} {YARD}, {JL}, a little confused", "RIGHT"), "confused, polite")),
 ("c20", 6, talk("c20", "Kevin", one(f"Close-up of {KEV} {YARD}, kneeling on the dirt, an apple in his hand, resentful, his voice low", "RIGHT"), "resentful, low")),
 ("c21", D8("c21"), (talk("c21", "Herminia", two(f"{HER} on the LEFT and {ANS} on the RIGHT, in profile facing each other beside the apple crates {YARD0}, framed from the waist up; "
     f"Herminia steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Herminia", "Anselmo"), "low, serious, confessing"),
   talk("c21", "Herminia", one(f"Close-up of {HER} {YARD}, {HL}, low and serious, confessing", "RIGHT"), "low, serious, confessing"))),
 ("c22", 6, talk("c22", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, stunned, his eyes shine, he slowly turns to look at the young man", "LEFT"), "stunned, low, moved")),
 ("c23", 6, S("c23", "Joel", f"Close-up of {JOE} {YARD0}, {JL}, confused and surprised, he looks at his grandmother", HER_B, "LEFT", "confused, surprised",
     f"Close-up of {JOE} {YARD}, {JL}, confused and surprised", "LEFT")),
 # CTA con carisma (después del BLACK): Anselmo solo, a cámara
 ("c24", 10, talk("c24", "Anselmo", f"Close-up from the chest up of {ANS} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his black cowboy hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y nunca te enseñé a pisotear a una viuda.", "Y nunca te enseñé a tratar así a una señora."), ("Me tiraron la cosecha, Anselmo.", "Se perdió mi cosecha, Anselmo."),
        ("Ya se ha de haber muerto, doña.", "Ya ni se ha de acordar, doña."), ("escondí a un hombre en mi sótano", "ayudé a un hombre en mi casa"),
        ("tips over", "moves"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("stunned", "surprised"),
        ("resentful", "serious"), ("powerful", "serious"), ("three dark pickup trucks", "three pickup trucks"),
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
          "Vertical scene from a Mexican TV drama, realistic, cold late-autumn light in an apple orchard packing yard in Chihuahua, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, apple orchard with wooden crates of red apples in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HERMINIA_OCHOA}", "a small elderly Mexican woman with white hair in a bun and a maroon knitted cardigan"),
         ("@{JOEL_OCHOA}", "a tall thin Mexican man in his late twenties with a short black beard, a plaid flannel shirt and a tan work jacket"),
         ("@{KEVIN_LOERA}", "a Mexican man in his thirties with slicked-back black hair, a thin mustache and a shiny black puffer jacket"),
         ("@{ANSELMO_QUINONES}", "a tall broad Mexican man in his sixties with a grey goatee, a black cowboy hat and a dark-brown sheepskin coat"),
         (" @{LOC_HUERTACUAUH}", "")]
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
