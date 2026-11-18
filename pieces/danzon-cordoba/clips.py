"""Genera los clips de danzon-cordoba PARTE 1 (El Danzón de Córdoba, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #39 "La maestra de baile" [CAPO] (Regreso, amnesia y pasado), cierre tipo 6 (mirada muda): en la plaza de Córdoba, don Feliciano (63), hacendado viudo, le pide una pieza
a Esperanza (58), la maestra de danzón con la que iba a casarse hace treinta años. Ella reclama que nunca recibió una carta; él jura que escribió cada mes. Llega su hermana Hermelinda (67),
ve a Esperanza, se le borra la cara y se va sin decir nada; mirada muda entre las dos.
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
# Geografía fija (plaza): Feliciano a la DERECHA junto al kiosco; Esperanza a la IZQUIERDA junto a las bancas de hierro; Hermelinda llega por la DERECHA desde los portales.
PLZ0 = ("in the main square of Cordoba, Veracruz @{LOC_PLAZACORDOBA} in the early warm afternoon: a white wrought-iron bandstand kiosk, tall laurel trees, colonial arcades, checkered tile floor, iron benches, soft golden light; "
        "no readable text, no signs, no logos")
PLZ = PLZ0 + "; nobody else in the background, no extras, nobody besides the person described"
FEL = ("@{FELICIANO_CARRANZA} (63-year-old Mexican man, fair tanned skin, silver hair combed back, a short silver beard, a cream linen suit jacket over a white guayabera, a white panama hat in his hand)")
ESP = ("@{ESPERANZA_LARA} (58-year-old Mexican woman, warm brown skin, black hair with a white streak in a low bun with a red flower, red lipstick, a flowing white dress with red embroidery, a red fan)")
HER = ("@{HERMELINDA_CARRANZA} (67-year-old Mexican woman, fair skin, short white curly hair, thin gold glasses, a dark-navy dress with a white collar, a pearl necklace, a small black handbag)")
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

FEL_B = "@{FELICIANO_CARRANZA} seen from behind (silver hair, cream linen suit jacket)"
ESP_B = "@{ESPERANZA_LARA} seen from behind (black low bun with a red flower, white dress)"
HER_B = "@{HERMELINDA_CARRANZA} seen from behind (short white curly hair, dark-navy dress)"
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

FR = "standing on the RIGHT by the white kiosk"
EL = "standing on the LEFT by the iron benches under the laurel trees"
HR = "standing on the RIGHT under the colonial arcades, a few steps behind her brother"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Feliciano YA hablando, mano tendida, Esperanza de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Feliciano", f"Medium close-up of {FEL} {PLZ0}, {FR}, talking from the very first frame, holding out one open hand toward her, a nervous hopeful smile", ESP_B, "LEFT", "hopeful, warm, nervous",
     f"Medium close-up of {FEL} {PLZ}, {FR}, talking from the very first frame, holding out one hand", "LEFT")),
 ("c02", 6, S("c02", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, proud and hurt, she closes her red fan with a snap", FEL_B, "RIGHT", "proud, hurt, cold",
     f"Close-up of {ESP} {PLZ}, {EL}, proud and hurt", "RIGHT")),
 ("c03", 6, S("c03", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, earnest, pressing his panama hat to his chest", ESP_B, "LEFT", "earnest, sad, sincere",
     f"Close-up of {FEL} {PLZ}, {FR}, earnest, hat on his chest", "LEFT")),
 ("c04", 6, S("c04", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, eyes narrowing, a sharp knowing question", FEL_B, "RIGHT", "sharp, bitter, knowing",
     f"Close-up of {ESP} {PLZ}, {EL}, eyes narrowing", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, ashamed, lowering his eyes, then looking at her again", ESP_B, "LEFT", "ashamed, sad, honest",
     f"Close-up of {FEL} {PLZ}, {FR}, ashamed", "LEFT")),
 ("c06", 6, S("c06", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, eyes shining with old pain, voice tight", FEL_B, "RIGHT", "tight, sad, hurt",
     f"Close-up of {ESP} {PLZ}, {EL}, eyes shining, voice tight", "RIGHT")),
 ("c07", 6, S("c07", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, confused, insisting, shaking his head slowly", ESP_B, "LEFT", "confused, insisting, sincere",
     f"Close-up of {FEL} {PLZ}, {FR}, confused, insisting", "LEFT")),
 ("c08", D8("c08"), S("c08", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, she glances at the kiosk, remembering, hurt", FEL_B, "RIGHT", "soft, sad, nostalgic",
     f"Close-up of {ESP} {PLZ}, {EL}, remembering", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, slowly realizing something, a shadow of doubt crossing his face", ESP_B, "LEFT", "slow, doubtful, troubled",
     f"Close-up of {FEL} {PLZ}, {FR}, a shadow of doubt", "LEFT")),
 ("c10", 6, S("c10", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, softer, curious despite herself", FEL_B, "RIGHT", "soft, curious, guarded",
     f"Close-up of {ESP} {PLZ}, {EL}, softer, curious", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, a sad gentle smile, looking around the square", ESP_B, "LEFT", "gentle, sad, warm",
     f"Close-up of {FEL} {PLZ}, {FR}, sad gentle smile", "LEFT")),
 ("c12", 6, S("c12", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, a proud sad smile, she opens her red fan slowly; a faded red ribbon is tied to the fan handle", FEL_B, "RIGHT", "proud, sad, tender",
     f"Close-up of {ESP} {PLZ}, {EL}, proud sad smile, opening her fan", "RIGHT")),
 ("i01", 6, f"Close-up insert {PLZ0}: a woman's hand holding a red folding fan, a faded old red silk ribbon tied around its handle, soft golden light; no faces, no readable text. No dialogue."),
 ("c13", 6, S("c13", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, moved, staring at the ribbon on her fan, his voice breaking a little", ESP_B, "LEFT", "moved, soft, emotional",
     f"Close-up of {FEL} {PLZ}, {FR}, moved, staring", "LEFT")),
 ("c14", 6, S("c14", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, eyes wet, a small shy smile", FEL_B, "RIGHT", "tender, shy, emotional",
     f"Close-up of {ESP} {PLZ}, {EL}, eyes wet, small smile", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, a tender smile, holding out his hand again", ESP_B, "LEFT", "tender, warm, hopeful",
     f"Close-up of {FEL} {PLZ}, {FR}, tender smile, hand held out", "LEFT")),
 ("r1", 6, f"Medium two-shot {PLZ}: {ESP} hesitates, then places her hand in the hand of {FEL}; they begin a slow elegant danzon step together next to the white kiosk, close, looking into each other's eyes; only these two people. No dialogue."),
 ("c16", 6, S("c16", "Hermelinda", f"Close-up of {HER} {PLZ0}, {HR}, impatient, calling her brother, then her eyes land on the woman and she stops", FEL_B, "LEFT", "impatient, stiff, cold",
     f"Close-up of {HER} {PLZ}, {HR}, impatient, calling her brother", "LEFT")),
 ("r2", 6, one(f"Close-up of {HER} {PLZ}, {HR}, frozen, staring at the other woman, her face hardens, she grips her handbag", "LEFT") + " No dialogue."),
 ("c17", 6, S("c17", "Hermelinda", f"Close-up of {HER} {PLZ0}, {HR}, cold and stiff, looking down at the other woman over her glasses", ESP_B, "LEFT", "cold, stiff, disdainful",
     f"Close-up of {HER} {PLZ}, {HR}, cold, over her glasses", "LEFT")),
 ("c18", 6, S("c18", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, she lets go of his hand, faces the older woman, calm and cutting", HER_B, "RIGHT", "calm, cutting, firm",
     f"Close-up of {ESP} {PLZ}, {EL}, calm and cutting", "RIGHT")),
 ("r3", 6, one(f"Medium shot of {HER} {PLZ}, {HR}, without a word she turns her back and walks away toward the colonial arcades, stiff, clutching her handbag", "LEFT") + " No dialogue."),
 ("c19", 6, S("c19", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, turning his head toward his sister walking away, a painful suspicion in his voice", HER_B, "RIGHT", "slow, hurt, suspicious",
     f"Close-up of {FEL} {PLZ}, {FR}, looking after his sister, suspicious", "RIGHT")),
 ("r4", 6, one(f"Close-up of {HER} {PLZ}, standing under the colonial arcades on the RIGHT, she stops and looks back over her shoulder, a long silent cold look, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r5", 6, one(f"Close-up of {ESP} {PLZ}, {EL}, silent, holding the older woman's look, a long knowing stare, her jaw set, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Esperanza a cámara
 ("c20", 10, talk("c20", "Esperanza", f"Close-up from the chest up of {ESP} {PLZ}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, opens her red fan and fans herself slowly, raises one eyebrow, gestures with the closed fan, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("impatient, stiff, cold", "impatient, stiff"), ("bitter, tight, sad", "tight, sad"), ("the color leaves her face", "her expression changes"), ("bitter", "sad"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm golden afternoon light in a colonial town square with a white kiosk in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican town square with a kiosk and laurel trees, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FELICIANO_CARRANZA}", "a Mexican man in his sixties with silver hair, a short silver beard and a cream linen suit jacket over a guayabera"),
         ("@{ESPERANZA_LARA}", "a Mexican woman in her late fifties with a black low bun with a red flower and a white embroidered dress"),
         ("@{HERMELINDA_CARRANZA}", "an older Mexican woman with short white curly hair, thin gold glasses and a dark-navy dress"),
         (" @{LOC_PLAZACORDOBA}", "")]
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
