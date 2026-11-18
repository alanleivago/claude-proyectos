"""Genera los clips de flores-tapalpa PARTE 1 (Las Flores de Tapalpa, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #16 "El pretendiente del mercado" [CAPO] (Bodas, compromisos y pretendientes), cierre tipo 1 (entra un personaje inesperado): doña Hortensia (60), viuda dueña de una hacienda en Tapalpa,
invita a cenar a Gael (30), el florista del mercado novio de su hija Valentina (27), para humillarlo. Presume que esa noche llega su socio, don Patricio, dueño de las tierras de junto.
Llega don Patricio (64), le pone la mano en el hombro a Gael: "Veo que ya conociste a mi hijo."
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
# Geografía fija (comedor): Hortensia sentada a la DERECHA en la cabecera; Gael sentado a la IZQUIERDA; Valentina sentada a la IZQUIERDA junto a Gael; el arco de entrada al fondo a la izquierda.
YARD0 = ("in the dining room of an old hacienda in Tapalpa, Jalisco @{LOC_COMEDORTAPALPA} at night: a dark carved wooden table with a white lace tablecloth, antique porcelain plates, crystal glasses, "
         "a silver candelabra with lit candles, a vase of fresh flowers, white adobe walls, dark wooden ceiling beams, warm candlelight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOR = ("@{HORTENSIA_SALAZAR} (60-year-old Mexican woman, fair skin, short ash-blonde hair in stiff waves, coral lipstick, a navy-blue silk blouse with a high collar, a large gold brooch)")
VAL = ("@{VALENTINA_SALAZAR} (27-year-old Mexican woman, light skin, long straight light-brown hair with a side part, pearl stud earrings, a simple burgundy long-sleeve dress)")
GAE = ("@{GAEL_ITURBE} (30-year-old Mexican man, warm brown skin, short curly black hair, clean-shaven, a clean white cotton shirt buttoned to the neck with sleeves rolled)")
PAT = ("@{PATRICIO_ITURBE} (64-year-old Mexican man, brown skin, white hair combed back, a neat white mustache, a dark-grey three-piece suit with a white shirt and no tie)")
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

HOR_B = "@{HORTENSIA_SALAZAR} seen from behind (short ash-blonde hair in stiff waves, navy-blue silk blouse)"
VAL_B = "@{VALENTINA_SALAZAR} seen from behind (long straight light-brown hair, burgundy dress)"
GAE_B = "@{GAEL_ITURBE} seen from behind (short curly black hair, white cotton shirt)"
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

HR = "seated on the RIGHT at the head of the table"
GL = "seated on the LEFT side of the table"
VL = "seated on the LEFT side of the table, next to the young man"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Hortensia YA hablando, mirando las manos de Gael, él de espaldas en el borde.
 ("c01", 6, S("c01", "Hortensia", f"Medium close-up of {HOR} {YARD0}, {HR}, talking from the very first frame, looking down at the young man's hands with disdain, holding a crystal glass", GAE_B, "LEFT", "haughty, disdainful, sharp",
     f"Medium close-up of {HOR} {YARD}, {HR}, talking from the very first frame, disdainful", "LEFT")),
 ("c02", D8("c02"), S("c02", "Gael", f"Close-up of {GAE} {YARD0}, {GL}, calm and kind, he shows his open hands on the tablecloth", HOR_B, "RIGHT", "calm, kind, proud",
     f"Close-up of {GAE} {YARD}, {GL}, calm and kind", "RIGHT")),
 ("c03", 6, S("c03", "Valentina", f"Close-up of {VAL} {YARD0}, {VL}, embarrassed and pleading, looking at her mother", HOR_B, "RIGHT", "embarrassed, pleading, soft",
     f"Close-up of {VAL} {YARD}, {VL}, embarrassed and pleading", "RIGHT")),
 ("c04", D8("c04"), S("c04", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, a false smile, she taps an antique porcelain plate with one fingernail", GAE_B, "LEFT", "falsely sweet, superior",
     f"Close-up of {HOR} {YARD}, {HR}, a false smile", "LEFT")),
 ("c05", 6, S("c05", "Gael", f"Close-up of {GAE} {YARD0}, {GL}, serene, a polite smile, holding her gaze", HOR_B, "RIGHT", "serene, polite, firm",
     f"Close-up of {GAE} {YARD}, {GL}, serene, a polite smile", "RIGHT")),
 ("r1", 6, one(f"Close-up of {HOR} {YARD}, {HR}, her false smile freezes, she slowly puts down her glass, offended, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c06", 6, S("c06", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, a short mocking laugh, she raises one eyebrow", GAE_B, "LEFT", "mocking, cold, amused",
     f"Close-up of {HOR} {YARD}, {HR}, a short mocking laugh", "LEFT")),
 ("c07", 6, S("c07", "Valentina", f"Close-up of {VAL} {YARD0}, {VL}, eyes wet, hurt but brave, she takes the young man's hand on the table", HOR_B, "RIGHT", "hurt, brave, emotional",
     f"Close-up of {VAL} {YARD}, {VL}, eyes wet, hurt but brave", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, smug, she glances toward the arched doorway and fixes her brooch", GAE_B, "LEFT", "smug, proud, dismissive",
     f"Close-up of {HOR} {YARD}, {HR}, smug, fixing her brooch", "LEFT")),
 ("c09", 6, S("c09", "Gael", f"Close-up of {GAE} {YARD0}, {GL}, a small knowing smile, he slowly puts his napkin on the table", HOR_B, "RIGHT", "calm, knowing, light",
     f"Close-up of {GAE} {YARD}, {GL}, a small knowing smile", "RIGHT")),
 ("c10", 6, S("c10", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, irritated and suspicious, she leans forward", GAE_B, "LEFT", "irritated, suspicious, sharp",
     f"Close-up of {HOR} {YARD}, {HR}, irritated, leaning forward", "LEFT")),
 ("i01", 6, f"Insert {YARD0}: the arched doorway of the dining room, the heavy wooden hall door beyond it slowly swings open, warm candlelight, the hallway still empty; no people visible yet, no text. No dialogue."),
 ("r2", 6, one(f"Medium shot of {PAT} {YARD}, standing in the arched doorway of the dining room, he takes off his black felt hat, smiling warmly, then he walks in slowly", "LEFT") + " No dialogue."),
 ("c11", D8("c11"), talk("c11", "Patricio", two(f"{PAT} standing on the LEFT behind the seated {GAE}, resting one hand proudly on the young man's shoulder, {YARD0}, framed from the waist up; the older man smiles toward the head of the table, "
     f"the young man stays calm") + " " + MOUTH("Patricio", "the young man"), "warm, proud, cordial")),
 ("r3", 6, one(f"Close-up of {HOR} {YARD}, {HR}, frozen, her face goes pale, the crystal glass trembles in her hand, her mouth opens without a word", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Gael a cámara
 ("c12", 10, talk("c12", "Gael", f"Close-up from the chest up of {GAE} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts the rolled sleeve of his shirt, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("haughty, disdainful, sharp", "proud, cool"), ("disdainful", "cool"), ("disdain", "doubt"), ("mocking", "amused"), ("haughty", "proud"), ("dismissive", "proud"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm candlelight in the dining room of an old hacienda in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, candlelit hacienda dining room in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HORTENSIA_SALAZAR}", "a proud Mexican woman around sixty with short ash-blonde waved hair, coral lipstick, a navy-blue silk blouse and a gold brooch"),
         ("@{VALENTINA_SALAZAR}", "a young Mexican woman with long straight light-brown hair, pearl earrings and a burgundy dress"),
         ("@{GAEL_ITURBE}", "a Mexican man around thirty with short curly black hair and a clean white cotton shirt with rolled sleeves"),
         ("@{PATRICIO_ITURBE}", "a distinguished Mexican man in his sixties with white hair, a white mustache and a dark-grey three-piece suit"),
         (" @{LOC_COMEDORTAPALPA}", "")]
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
