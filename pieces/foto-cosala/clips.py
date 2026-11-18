"""Genera los clips de foto-cosala PARTE 1 (La Foto del Cumpleaños, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #41 "La foto del cumpleaños" [CAPO] (Chantajes y pruebas), cierre tipo 4 (el villano descubre que lo oyeron): en la cocina de la fiesta de cumpleaños de don Cipriano en Cosalá,
Fabián (24), ayudante de la banquetera (ropa de diario), recoge una foto que se le cayó a Benito (52), el socio del patrón: Benito abrazado con don Horacio Lugo, el rival de don Cipriano.
Benito lo presiona para que la devuelva y calle; Fabián toca el celular en su bolsa de la camisa: "Todo lo que dijo se quedó aquí". Benito se da cuenta de que lo grabó.
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
# Geografía fija (cocina): Benito a la DERECHA junto a la puerta con luces de fiesta; Fabián a la IZQUIERDA junto a la mesa de trabajo con charolas de copas.
KIT0 = ("in the large old kitchen of a rancher's colonial house in Cosala, Sinaloa @{LOC_COCINACOSALA} at night during a party: yellow tiled walls, copper pots hanging, a long wooden work table with trays of glasses and plates, "
        "a doorway with warm light and blurred party lights beyond; no readable text, no signs, no logos")
KIT = KIT0 + "; nobody else in the background, no extras, nobody besides the person described"
BEN = ("@{BENITO_QUIROGA} (52-year-old Mexican man, light-brown skin, slicked-back dark hair greying at the sides, a thin trimmed goatee, small cold eyes, a charcoal-grey suit jacket over an open-collar black shirt)")
FAB = ("@{FABIAN_ROSAS} (24-year-old Mexican young man, brown skin, short curly black hair, clean-shaven, honest dark eyes, a plain white long-sleeve shirt with rolled sleeves, a smartphone in his shirt pocket)")
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

BEN_B = "@{BENITO_QUIROGA} seen from behind (slicked-back dark hair greying at the sides, charcoal-grey suit jacket)"
FAB_B = "@{FABIAN_ROSAS} seen from behind (short curly black hair, plain white shirt)"
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

BR = "standing on the RIGHT by the doorway with the party lights"
FL = "standing on the LEFT by the work table with trays of glasses"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Benito YA hablando, tenso, la mano extendida; Fabián de espaldas en el borde con la foto.
 ("c01", 6, S("c01", "Benito", f"Medium close-up of {BEN} {KIT0}, {BR}, talking from the very first frame, tense and cold, one open hand held out, eyes fixed on a small printed photo in the young man's hand", FAB_B, "LEFT", "tense, cold, controlled",
     f"Medium close-up of {BEN} {KIT}, {BR}, talking from the very first frame, tense and cold, one hand held out", "LEFT")),
 ("c02", 6, S("c02", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, holding a small printed photo face down, surprised, a little nervous", BEN_B, "RIGHT", "surprised, nervous, polite",
     f"Close-up of {FAB} {KIT}, {FL}, holding a small photo, a little nervous", "RIGHT")),
 ("c03", 6, S("c03", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, stepping closer, voice low, studying the young man's face", FAB_B, "LEFT", "low, suspicious, pressing",
     f"Close-up of {BEN} {KIT}, {BR}, voice low, suspicious", "LEFT")),
 ("c04", D8("c04"), S("c04", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, he swallows and answers honestly, glancing down at the photo and back up", BEN_B, "RIGHT", "honest, uneasy, quiet",
     f"Close-up of {FAB} {KIT}, {FL}, honest and uneasy", "RIGHT")),
 ("i01", 6, f"Close-up insert {KIT0}: a young man's hand holding a small printed color photograph showing two men in their fifties hugging and smiling at a restaurant table, one of them with slicked-back greying hair and a thin goatee; no readable text, no letters, no logos. No dialogue."),
 ("c05", 6, S("c05", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, a forced thin smile, cold eyes, adjusting his gold signet ring", FAB_B, "LEFT", "cold, dismissive, condescending",
     f"Close-up of {BEN} {KIT}, {BR}, forced thin smile, cold eyes", "LEFT")),
 ("c06", D8("c06"), S("c06", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, he straightens up, his voice steady now, loyal and firm", BEN_B, "RIGHT", "loyal, steady, firm",
     f"Close-up of {FAB} {KIT}, {FL}, steady, loyal and firm", "RIGHT")),
 ("c07", D8("c07"), S("c07", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, a short mocking laugh, then hard, leaning in", FAB_B, "LEFT", "mocking, arrogant, hard",
     f"Close-up of {BEN} {KIT}, {BR}, mocking, leaning in", "LEFT")),
 ("c08", 6, S("c08", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, hand held out again, a quiet pressing voice", FAB_B, "LEFT", "quiet, pressing, cold",
     f"Close-up of {BEN} {KIT}, {BR}, hand held out, quiet and pressing", "LEFT")),
 ("c09", 6, S("c09", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, calm now, he taps twice with two fingers on the smartphone in his shirt pocket, the screen lit, a small steady look", BEN_B, "RIGHT", "calm, quiet, confident",
     f"Close-up of {FAB} {KIT}, {FL}, calm, tapping the smartphone in his shirt pocket", "RIGHT")),
 ("r1", 6, one(f"Close-up of {BEN} {KIT}, {BR}, frozen, his eyes drop slowly to the young man's shirt pocket, his forced smile disappears, his jaw tightens, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r2", 6, one(f"Close-up of {FAB} {KIT}, {FL}, holding the gaze in silence, the lit smartphone visible in his shirt pocket, he slowly puts the photo inside his shirt pocket too", "RIGHT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Fabián a cámara
 ("c10", 10, talk("c10", "Fabián", f"Close-up from the chest up of {FAB} {KIT}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, taps the smartphone in his shirt pocket, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("mocking, arrogant, hard", "mocking, arrogant"), ("cold, dismissive, condescending", "cold, dismissive"), ("pressing", "insistent"), ("jaw tightens", "face tenses"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm night light in the old kitchen of a rancher's house during a party in Sinaloa, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican house kitchen at night with party lights in the doorway, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{BENITO_QUIROGA}", "a Mexican man in his fifties with slicked-back greying hair, a thin goatee and a charcoal-grey suit jacket over a black shirt"),
         ("@{FABIAN_ROSAS}", "a young Mexican man with short curly black hair in a plain white shirt with rolled sleeves and a phone in his shirt pocket"),
         (" @{LOC_COCINACOSALA}", "")]
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
