"""Genera los clips de cafe-pluma PARTE 1 (El Cafetal de Pluma, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que el villano no cree -> llega el patrón -> plazo invertido -> giro familiar): en un cafetal de Pluma Hidalgo, Oaxaca, Rodrigo
Arteaga (34) quiere sacar a doña Eulalia (66) de su loma "antes de la cosecha" y le tira un costal de café; su hijo Mateo (30) la defiende. Eulalia llama a don Severiano (70), papá de Rodrigo
y patrón del café de la sierra, a quien ella le dio de comer cuando no tenía nada. Plazo invertido. Giro: Severiano se casó con Eulalia antes que con la mamá de Rodrigo y nunca se divorciaron.
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
# Geografía fija (patio de secado): Eulalia y Mateo a la IZQUIERDA (casa de adobe); Rodrigo y Severiano a la DERECHA (camino de la loma).
YARD0 = ("on the concrete drying patio of a coffee farm in the mountains of Pluma Hidalgo, Oaxaca @{LOC_CAFETALPLUMA} in the morning: coffee beans spread out to dry, burlap sacks, "
         "an old adobe house with a tile roof, green coffee plants and misty mountain slopes behind, soft light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
SACK = "a burlap sack full of roasted coffee beans"
PHONE = "an old small cell phone"
EUL = ("@{EULALIA_RUIZ} (66-year-old Mexican woman, brown skin, grey hair in a long braid, a dark-green embroidered blouse, a beige rebozo shawl on her shoulders)")
MAT = ("@{MATEO_RUIZ} (30-year-old Mexican man, brown skin, short black hair, clean-shaven, a light-grey work shirt with rolled sleeves)")
ROD = ("@{RODRIGO_ARTEAGA} (34-year-old Mexican man, light skin, wavy dark-brown hair combed back, a trimmed beard, a navy-blue quilted vest over a white shirt)")
SEV = ("@{SEVERIANO_ARTEAGA} (70-year-old Mexican man, tall, light-brown skin, white hair, a grey goatee, a brown felt cowboy hat, a black wool jacket over a cream shirt, a bolo tie)")
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

# Bordes: Rodrigo o Severiano le hablan a Eulalia/Mateo -> espalda LEFT; Eulalia o Mateo les hablan -> espalda RIGHT.
EUL_B = "@{EULALIA_RUIZ} seen from behind (grey hair in a long braid, beige rebozo shawl over a dark-green blouse)"
MAT_B = "@{MATEO_RUIZ} seen from behind (short black hair, light-grey work shirt, a straw hat hanging on his back)"
ROD_B = "@{RODRIGO_ARTEAGA} seen from behind (wavy dark-brown hair, navy-blue quilted vest over a white shirt)"
SEV_B = "@{SEVERIANO_ARTEAGA} seen from behind (brown felt cowboy hat, black wool jacket, tall)"
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

EL = "standing on the LEFT by her coffee sacks, in front of the adobe house"   # Eulalia
ML = "standing on the LEFT beside the adobe house"                             # Mateo
RR = "standing on the RIGHT on the patio, the path down the slope behind him"  # Rodrigo
SR = "standing on the RIGHT on the patio, coffee plants behind him"            # Severiano

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rodrigo YA hablando en el patio; Eulalia de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Rodrigo", f"Medium close-up of {ROD} {YARD0}, {RR}, talking from the very first frame, arrogant, he kicks a few coffee beans with the tip of his shoe", EUL_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {ROD} {YARD}, {RR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Eulalia", f"Close-up of {EUL} {YARD0}, {EL}, calm and proud, a handful of coffee beans in her palm", ROD_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {EUL} {YARD}, {EL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, a cold smile, he spreads his arms toward the mountains", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {MAT} {YARD}, {ML}, already in place carrying nothing, he stops and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey work shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Mateo", f"Close-up of {MAT} {YARD0}, {ML}, firm and protective", ROD_B, "RIGHT", "firm, protective",
     f"Close-up of {MAT} {YARD}, {ML}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Rodrigo", f"Close-up of {ROD} {YARD0}, {RR}, he laughs once, mocking", MAT_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {ROD} {YARD}, {RR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {SACK} tips over on the concrete patio and the dark coffee beans spill out across the ground; only the sack and the beans, no face, no people. No dialogue."),
 ("c06", 6, S("c06", "Eulalia", f"Close-up of {EUL} {YARD0}, {EL}, her eyes shine, hurt but dignified, she looks down at the spilled coffee", ROD_B, "RIGHT", "hurt, dignified",
     f"Close-up of {EUL} {YARD}, {EL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, mocking, he dusts off his hands", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {EUL} {YARD}, she slowly crouches and gathers spilled coffee beans back into the sack with both hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman with a grey braid')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Eulalia", two(f"{EUL} on the LEFT and {MAT} on the RIGHT, close together by the adobe house {YARD0}, framed from the waist up; "
     f"Eulalia speaks calmly to her son, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eulalia", "Mateo"), "calm, firm, low"),
   talk("c08", "Eulalia", one(f"Close-up of {EUL} {YARD}, {EL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, laughing, amused, arms crossed", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs driving slowly up a winding dirt road between green coffee plants on a misty mountain slope in Oaxaca, soft morning light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {SEV} {YARD}, {SR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a brown felt hat')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Severiano", f"Close-up of {SEV} {YARD0}, {SR}, warm and respectful, he touches the brim of his hat", EUL_B, "LEFT", "warm, respectful",
     f"Close-up of {SEV} {YARD}, {SR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Severiano", one(f"Close-up of {SEV} {YARD}, {SR}, cold and serious, he looks at his son", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Severiano", one(f"Close-up of {SEV} {YARD}, {SR}, he gestures at the spilled coffee, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {ROD} {YARD}, he crouches on the patio and gathers spilled coffee beans into the sack with his hands, head lowered, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a navy-blue vest')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Mateo", f"Close-up of {MAT} {YARD0}, {ML}, grateful but confused", SEV_B, "RIGHT", "grateful, puzzled",
     f"Close-up of {MAT} {YARD}, {ML}, grateful but confused", "RIGHT")),
 ("c15", 6, S("c15", "Severiano", f"Close-up of {SEV} {YARD0}, {SR}, serious, he looks at the woman meaningfully", EUL_B, "LEFT", "serious, low",
     f"Close-up of {SEV} {YARD}, {SR}, serious", "LEFT")),
 ("c16", 6, talk("c16", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, confused and worried", "LEFT"), "confused, worried")),
 ("c17", D8("c17"), (talk("c17", "Eulalia", two(f"{EUL} on the LEFT and {ROD} on the RIGHT, facing each other on the patio {YARD0}, framed from the waist up; "
     f"Eulalia, calm and firm, speaks low to him, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eulalia", "Rodrigo"), "low, firm, slow"),
   talk("c17", "Eulalia", one(f"Close-up of {EUL} {YARD}, {EL}, low and firm", "RIGHT"), "low, firm, slow"))),
 # CTA con carisma (después del BLACK): Eulalia sola, a cámara
 ("c18", 10, talk("c18", "Eulalia", f"Close-up from the chest up of {EUL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts the rebozo on her shoulders, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y tú le tiras su café.", "Y tú le maltratas su café."), ("A ver si así aprende.", "A ver si así entiende."),
        ("tips over", "lies open"), ("humiliated", "quiet"), ("contemptuous", "cool"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, soft morning light on the drying patio of a coffee farm in the mountains of Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, coffee farm patio in the Mexican mountains, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EULALIA_RUIZ}", "a Mexican woman in her sixties with brown skin, grey hair in a long braid, a dark-green embroidered blouse and a beige rebozo shawl"),
         ("@{MATEO_RUIZ}", "a Mexican man around thirty with brown skin, short black hair and a light-grey work shirt"),
         ("@{RODRIGO_ARTEAGA}", "a Mexican man in his thirties with wavy dark-brown hair combed back, a trimmed beard and a navy-blue quilted vest"),
         ("@{SEVERIANO_ARTEAGA}", "a tall elderly Mexican man with white hair, a grey goatee, a brown felt cowboy hat and a black wool jacket"),
         (" @{LOC_CAFETALPLUMA}", "")]
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
