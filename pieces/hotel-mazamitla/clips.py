"""Genera los clips de hotel-mazamitla PARTE 1 (El Hotel de Mazamitla, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #28 "La recepcionista del hotel" [CAPO] (Revancha del empleado humillado), cierre tipo 3 (palabra reveladora: "hermana"): de noche, en la recepción del hotel de montaña,
Sebastián (29), hijo del dueño, humilla a Liliana (27), la recepcionista, porque no le da una suite ocupada. Ella no cede. Llega don Alfonso (62), el dueño, la conoce por su nombre
y le da la razón. "Sebastián… te presento a tu hermana." Corte en el hijo.
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
# Geografía fija (recepción): Liliana a la IZQUIERDA detrás del mostrador; Sebastián a la DERECHA frente al mostrador; Alfonso entra por la DERECHA y queda junto a su hijo.
LOB0 = ("in the lobby of a luxury mountain lodge hotel in Mazamitla, Jalisco @{LOC_HOTELMAZAMITLA} at night: a polished dark-wood reception counter with a small brass bell and a lamp, stone walls, a lit stone fireplace, wooden beams, "
        "large windows with dark pine forest outside, warm amber light; no readable text, no signs, no logos")
LOB = LOB0 + "; nobody else in the background, no extras, nobody besides the person described"
SEB = ("@{SEBASTIAN_LOZADA} (29-year-old Mexican man, fair skin, styled swept-back light-brown hair, clean-shaven, arrogant smirk, a camel wool coat over a white turtleneck sweater)")
LIL = ("@{LILIANA_CRUZ} (27-year-old Mexican woman, warm brown skin, long dark-brown hair in a neat low ponytail, calm dark eyes, a plain dark-green knit cardigan over a white blouse)")
ALF = ("@{ALFONSO_LOZADA} (62-year-old Mexican man, fair tanned skin, neat silver hair, a short trimmed grey beard, a dark charcoal overcoat over a navy suit with an open-collar light-blue shirt)")
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

SEB_B = "@{SEBASTIAN_LOZADA} seen from behind (swept-back light-brown hair, camel wool coat)"
LIL_B = "@{LILIANA_CRUZ} seen from behind (dark-brown low ponytail, dark-green knit cardigan), behind the counter"
ALF_B = "@{ALFONSO_LOZADA} seen from behind (neat silver hair, dark charcoal overcoat)"
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

LL = "standing on the LEFT behind the dark-wood reception counter"
SR = "standing on the RIGHT in front of the reception counter"
AR = "standing on the RIGHT in front of the counter, beside his son"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Sebastián YA hablando, prepotente, Liliana de espaldas en el borde.
 ("c01", 6, S("c01", "Sebastián", f"Medium close-up of {SEB} {LOB0}, {SR}, talking from the very first frame, arrogant, he slaps his palm on the counter, leaning in", LIL_B, "LEFT", "arrogant, cold, condescending",
     f"Medium close-up of {SEB} {LOB}, {SR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, polite and calm, a professional small smile, not intimidated", SEB_B, "RIGHT", "polite, calm, firm",
     f"Close-up of {LIL} {LOB}, {LL}, polite and calm", "RIGHT")),
 ("c03", 6, S("c03", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, a mocking laugh, spreading his arms", LIL_B, "LEFT", "mocking, arrogant, loud",
     f"Close-up of {SEB} {LOB}, {SR}, mocking laugh", "LEFT")),
 ("c04", D8("c04"), S("c04", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, she keeps her hands folded on the counter, calm and firm", SEB_B, "RIGHT", "calm, firm, respectful",
     f"Close-up of {LIL} {LOB}, {LL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, his smirk turns hard, leaning closer over the counter", LIL_B, "LEFT", "hard, arrogant, threatening",
     f"Close-up of {SEB} {LOB}, {SR}, leaning closer, hard", "LEFT")),
 ("c06", D8("c06"), S("c06", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, holding his gaze, steady, without raising her voice", SEB_B, "RIGHT", "steady, calm, brave",
     f"Close-up of {LIL} {LOB}, {LL}, steady", "RIGHT")),
 ("c07", 6, S("c07", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, irritated, snapping his fingers at her", LIL_B, "LEFT", "irritated, bossy, cold",
     f"Close-up of {SEB} {LOB}, {SR}, irritated, snapping his fingers", "LEFT")),
 ("c08", 6, S("c08", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, a small calm smile, she straightens a pen on the counter", SEB_B, "RIGHT", "calm, dry, confident",
     f"Close-up of {LIL} {LOB}, {LL}, small calm smile", "RIGHT")),
 ("c09", 6, S("c09", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, laughing at her, looking her up and down with contempt", LIL_B, "LEFT", "mocking, dismissive, amused",
     f"Close-up of {SEB} {LOB}, {SR}, laughing at her", "LEFT")),
 ("c10", 6, S("c10", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, proud, chin up, a firm voice", SEB_B, "RIGHT", "proud, firm, quiet",
     f"Close-up of {LIL} {LOB}, {LL}, proud, chin up", "RIGHT")),
 ("c11", 6, S("c11", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, a cruel smile, turning half away from her", LIL_B, "LEFT", "dismissive, cruel, cold",
     f"Close-up of {SEB} {LOB}, {SR}, cruel smile", "LEFT")),
 ("r1", 6, one(f"Medium shot of {ALF} {LOB}, walking in through the hotel's front door on the RIGHT, shaking off the cold, pulling a small suitcase, he stops and looks toward the counter", "LEFT") + " No dialogue."),
 ("c12", 6, S("c12", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, serious, commanding without raising his voice, looking from his son to the counter", SEB_B, "LEFT", "serious, commanding, calm",
     f"Close-up of {ALF} {LOB}, {AR}, serious and commanding", "LEFT")),
 ("c13", 6, S("c13", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, suddenly all smiles, turning to his father, pointing at the receptionist", ALF_B, "RIGHT", "fake, whiny, smug",
     f"Close-up of {SEB} {LOB}, {SR}, all smiles, pointing", "RIGHT")),
 ("c14", 6, S("c14", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, his face softens when he sees the receptionist, a warm worried look", LIL_B, "LEFT", "warm, soft, worried",
     f"Close-up of {ALF} {LOB}, {AR}, softening, warm look", "LEFT")),
 ("c15", D8("c15"), S("c15", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, respectful, a little nervous now, she lowers her eyes then looks up at him", ALF_B, "RIGHT", "respectful, nervous, honest",
     f"Close-up of {LIL} {LOB}, {LL}, respectful, a little nervous", "RIGHT")),
 ("c16", D8("c16"), S("c16", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, he nods slowly at her, then turns a hard look at his son", SEB_B, "LEFT", "firm, proud, stern",
     f"Close-up of {ALF} {LOB}, {AR}, firm, nodding", "LEFT")),
 ("c17", 6, S("c17", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, offended, disbelieving, his voice rising", ALF_B, "RIGHT", "offended, disbelieving, loud",
     f"Close-up of {SEB} {LOB}, {SR}, offended", "RIGHT")),
 ("c18", 6, S("c18", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, calm and grave, a short pause before his son's name", SEB_B, "LEFT", "grave, calm, meaningful",
     f"Close-up of {ALF} {LOB}, {AR}, calm and grave", "LEFT")),
 ("r2", 6, one(f"Close-up of {SEB} {LOB}, {SR}, confused, his smirk fading, he looks from his father to the receptionist and back", "LEFT") + " No dialogue."),
 ("c19", 6, S("c19", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, suspicious and nervous, his voice tighter", ALF_B, "RIGHT", "suspicious, nervous, tight",
     f"Close-up of {SEB} {LOB}, {SR}, suspicious and nervous", "RIGHT")),
 ("r3", 6, f"Medium two-shot {LOB}: {ALF} walks around the end of the reception counter and gently puts a hand on the shoulder of {LIL}; she looks up at him, nervous, emotional; only these two people. No dialogue."),
 ("c20", D8("c20"), S("c20", "Alfonso", f"Close-up of {ALF} {LOB0}, now standing beside the receptionist behind the counter, his hand on her shoulder, looking straight at his son, a pause before the last word", SEB_B, "RIGHT", "grave, emotional, firm",
     f"Close-up of {ALF} {LOB}, beside her behind the counter, grave and emotional", "RIGHT")),
 ("r4", 6, one(f"Close-up of {SEB} {LOB}, {SR}, frozen, his mouth falls slightly open, all the arrogance gone from his face, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Liliana a cámara
 ("c21", 10, talk("c21", "Liliana", f"Close-up from the chest up of {LIL} {LOB}, standing behind the counter, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, taps the small brass bell once, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("hard, arrogant, threatening", "hard, arrogant"), ("dismissive, cruel, cold", "dismissive, cold"), ("a cruel smile", "a cold smile"), ("cruel", "cold"), ("contempt", "disdain"), ("slaps his palm on", "puts his hand on"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm amber night light in the lobby of a mountain lodge hotel in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, luxury hotel reception with a stone fireplace at night in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEBASTIAN_LOZADA}", "a young Mexican man with swept-back light-brown hair in a camel wool coat over a white turtleneck"),
         ("@{LILIANA_CRUZ}", "a young Mexican woman with a dark-brown low ponytail in a dark-green cardigan over a white blouse"),
         ("@{ALFONSO_LOZADA}", "a Mexican man in his sixties with silver hair, a trimmed grey beard and a charcoal overcoat"),
         (" @{LOC_HOTELMAZAMITLA}", "")]
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
