"""Genera los clips de silla-izamal PARTE 1 (La Silla de Izamal, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #14 "El esposo que no camina" [CAPO], cierre tipo 4 (el villano descubre que lo vieron): en la terraza de su hacienda henequenera en Izamal, don Jacinto (66) finge seguir en
silla de ruedas y sin entender nada tras un accidente. Su esposa Graciela (52) y el administrador Octavio (46) planean poner la hacienda a nombre de ella con su huella; la cocinera Chabela (64)
lo defiende. A solas, Jacinto le habla a Chabela, se pone de pie y llama al licenciado: "Son los dos." Graciela vuelve y lo ve de pie.
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
# Geografía fija (terraza): Jacinto en su silla de ruedas al CENTRO-IZQUIERDA de espaldas a los arcos; Chabela a la IZQUIERDA; Graciela y Octavio a la DERECHA.
YARD0 = ("on the covered terrace of an old henequen hacienda near Izamal, Yucatán @{LOC_HACIENDAIZAMAL} in the afternoon: mustard-yellow walls, tall stone arches, a tiled floor, "
         "a hammock, a small wooden table, henequen agave fields beyond the arches, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CHAIR = "sitting still in an old wheelchair"
JAC = ("@{JACINTO_CERVERA} (66-year-old Mexican man, broad shoulders, light-brown skin, thick grey hair combed back, a grey mustache, a white long-sleeve guayabera, cream linen trousers)")
GRA = ("@{GRACIELA_CERVERA} (52-year-old Mexican woman, fair skin, black hair in an elegant low bun, red lipstick, pearl earrings, a fitted navy-blue dress)")
OCT = ("@{OCTAVIO_PENICHE} (46-year-old Mexican man, light skin, neat short brown hair with a side part, a trimmed brown beard, a light-grey linen shirt)")
CHA = ("@{CHABELA_CHAN} (64-year-old Mexican Mayan woman, brown skin, grey hair in a long braid, a white embroidered huipil dress with colorful flowers)")
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

GRA_B = "@{GRACIELA_CERVERA} seen from behind (black hair in a low bun, fitted navy-blue dress)"
OCT_B = "@{OCTAVIO_PENICHE} seen from behind (neat short brown hair, light-grey linen shirt)"
CHA_B = "@{CHABELA_CHAN} seen from behind (grey hair in a long braid, white embroidered huipil)"
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

BLANK = f"{JAC} {CHAIR} in the background between them, staring blankly at nothing, motionless, mouth closed the whole shot"
GR = "standing on the RIGHT side of the terrace"
OR = "standing on the RIGHT near an arch"
CL = "standing on the LEFT by the small wooden table"
JC = f"{CHAIR} at the center of the terrace"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def OTS3(cid, who, spk, lis_b, side, tone, one_desc, one_side):
    """OTS sobre el que escucha, con Jacinto ausente al fondo (3 personas, solo habla uno)."""
    return (talk(cid, who, f"Over-the-shoulder shot from behind {lis_b}: the listener's blurred shoulder and the back of the head fill the {side} edge of the frame in the foreground, "
                 f"out of focus, face never visible. {spk}, facing the camera three-quarters, talking to the person in the foreground; {BLANK}; only these three people, no extras. "
                 f"Only {who} speaks: {who}'s lips move clearly with every word; the others stay silent with closed mouths.", tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Graciela YA hablando, Octavio de espaldas, Jacinto ausente en su silla al fondo.
 ("c01", D8("c01"), OTS3("c01", "Graciela", f"Medium close-up of {GRA} {YARD0}, {GR}, talking from the very first frame, cold and careless, she gestures toward the man in the wheelchair", OCT_B, "LEFT", "cold, careless, low",
     f"Medium close-up of {GRA} {YARD}, {GR}, talking from the very first frame, cold and careless", "LEFT")),
 ("c02", 6, OTS3("c02", "Octavio", f"Close-up of {OCT} {YARD0}, {OR}, calculating, a small satisfied smile", GRA_B, "RIGHT", "calm, calculating, low",
     f"Close-up of {OCT} {YARD}, {OR}, calculating", "RIGHT")),
 ("c03", 6, talk("c03", "Graciela", one(f"Close-up of {GRA} {YARD}, {GR}, a cold proud smile, she touches her pearl earring", "LEFT"), "cold, proud")),
 ("r1", 6, one(f"Close-up of {JAC} {YARD}, {JC}, a blank empty stare, completely still, then his eyes move slightly to one side for an instant and go blank again", "RIGHT") + " Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Chabela", f"Close-up of {CHA} {YARD0}, {CL}, holding a tray with a cup of tea, worried and respectful", GRA_B, "RIGHT", "worried, respectful, soft",
     f"Close-up of {CHA} {YARD}, {CL}, holding a tray with a cup of tea, worried", "RIGHT")),
 ("c05", 6, S("c05", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, contemptuous, without looking at her", CHA_B, "LEFT", "contemptuous, cold",
     f"Close-up of {GRA} {YARD}, {GR}, contemptuous", "LEFT")),
 ("c06", 6, S("c06", "Octavio", f"Close-up of {OCT} {YARD0}, {OR}, worried, he lowers his voice", GRA_B, "RIGHT", "worried, low",
     f"Close-up of {OCT} {YARD}, {OR}, worried", "RIGHT")),
 ("c07", 6, S("c07", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, calm and cold, a thin smile", OCT_B, "LEFT", "calm, cold",
     f"Close-up of {GRA} {YARD}, {GR}, calm and cold", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: on the small wooden table, a printed document with an empty box for a fingerprint and an open ink pad next to it; no readable text, only the paper and the ink pad, no hands, no people. No dialogue."),
 ("c08", 6, talk("c08", "Graciela", two(f"{GRA} bending down beside {JAC} {CHAIR} {YARD0}, framed from the waist up; she kisses his forehead with a fake sweet smile and whispers, "
     f"he stares blankly ahead, motionless") + " " + MOUTH("Graciela", "Jacinto"), "falsely sweet, soft")),
 ("c09", 6, talk("c09", "Chabela", two(f"{CHA} kneeling beside {JAC} {CHAIR} {YARD0}, framed from the waist up; she holds his hand in both of hers and whispers to him, he stares blankly ahead") + " " + MOUTH("Chabela", "Jacinto"), "whispering, hopeful, emotional")),
 ("r2", 6, f"Close-up {YARD0}: the old man's hand in the wheelchair slowly squeezes the hand of the kneeling woman in the white embroidered huipil, firmly; only the two hands on the armrest of the wheelchair, no faces. No dialogue."),
 ("c10", 6, talk("c10", "Jacinto", two(f"{CHA} kneeling on the LEFT and {JAC} {CHAIR} on the RIGHT {YARD0}, framed from the waist up; his eyes come alive, he turns his head to her and speaks very low, "
     f"slightly closer to the camera and in sharper focus, she covers her mouth with one hand") + " " + MOUTH("Jacinto", "Chabela"), "very low, calm, firm")),
 ("c11", 6, talk("c11", "Chabela", one(f"Close-up of {CHA} {YARD}, kneeling, her eyes shine, one hand on her chest, amazed", "RIGHT"), "amazed, emotional, whispering")),
 ("c12", D8("c12"), talk("c12", "Jacinto", one(f"Close-up of {JAC} {YARD}, {JC}, his eyes sharp and alive now, calm and cold", "LEFT"), "calm, cold, slow")),
 ("r3", 6, f"Medium shot of {JAC} {YARD}, he slowly puts both hands on the armrests and stands up from the wheelchair, tall and steady, he straightens his guayabera; {SOLO}; {ALONE}; {NODOUBLE('man in a white guayabera')}. Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Jacinto", one(f"Close-up of {JAC} {YARD}, standing by the empty wheelchair, holding a cell phone to his ear, calm and powerful", "LEFT"), "calm, firm, low")),
 ("c14", 6, talk("c14", "Graciela", one(f"Close-up of {GRA} {YARD}, standing under an arch on the RIGHT, she has just come back for her shawl and stops, frozen, pale, staring", "LEFT"), "stunned, whispering, scared")),
 # CTA con carisma (después del BLACK): Jacinto de pie, a cámara
 ("c15", 10, talk("c15", "Jacinto", f"Close-up from the chest up of {JAC} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, rests one hand on the handle of the empty wheelchair, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small cold half smile. Nobody else around.",
     "charismatic, grave, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Quería saber quién me iba a traicionar primero.", "Quería saber quién me iba a fallar primero."), ("contemptuous", "cool"), ("calculating", "calm"),
        ("stunned", "surprised"), ("scared", "worried"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light on the arched terrace of an old henequen hacienda in Yucatán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, yellow hacienda terrace with stone arches in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{JACINTO_CERVERA}", "a broad-shouldered Mexican man in his sixties with thick grey hair combed back, a grey mustache and a white guayabera"),
         ("@{GRACIELA_CERVERA}", "an elegant Mexican woman in her fifties with black hair in a low bun, pearl earrings and a navy-blue dress"),
         ("@{OCTAVIO_PENICHE}", "a Mexican man in his forties with neat short brown hair, a trimmed brown beard and a light-grey linen shirt"),
         ("@{CHABELA_CHAN}", "a Mexican Mayan woman in her sixties with grey hair in a long braid and a white embroidered huipil dress"),
         (" @{LOC_HACIENDAIZAMAL}", "")]
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
