"""Genera los clips de prueba-penjamo PARTE 1 (La Prueba de la Sobremesa, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #43 "La prueba de ADN en la sobremesa" [CAPO] (Chantajes y pruebas), cierre tipo 5 (la acusación se vuelve contra quien acusa): en el portal de su rancho en Pénjamo,
el hijo mayor Saúl (41), harto de que el patrón Evodio (68) prefiera a Gerónimo (32), pone sobre la mesa un sobre con una prueba de paternidad. Evodio lo lee, lo cierra:
"Ya lo sabía… ¿Y tú? ¿Quieres saber de quién eres hijo?". Saúl se queda helado.
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
# Geografía fija (portal): Evodio SENTADO a la DERECHA en la cabecera; Gerónimo SENTADO a la DERECHA junto a su padre; Saúl DE PIE a la IZQUIERDA junto a la mesa.
PORCH0 = ("on the wide stone porch of an old cattle ranch house in Penjamo, Guanajuato @{LOC_PORTALPENJAMO} in the late golden afternoon: thick stone arches with magenta bougainvillea, a long rustic wooden table with clay plates and glasses, "
          "dry hills and mesquite trees in the distance; a plain white envelope lies on the table; no readable text, no signs, no logos")
PORCH = PORCH0 + "; nobody else in the background, no extras, nobody besides the person described"
EVO = ("@{EVODIO_SALCEDO} (68-year-old Mexican man, tanned weathered skin, thick white hair combed back, a full white mustache, heavy eyebrows, a dark-brown suede jacket over a white shirt buttoned to the collar)")
SAU = ("@{SAUL_SALCEDO} (41-year-old Mexican man, light-brown skin, short black hair with grey at the temples, clean-shaven, a tense square jaw, a navy-blue quilted vest over a light-blue checkered shirt)")
GER = ("@{GERONIMO_SALCEDO} (32-year-old Mexican man, olive skin, wavy dark-brown hair, a short trimmed beard, a beige linen shirt with rolled sleeves)")
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

EVO_B = "@{EVODIO_SALCEDO} seen from behind (thick white hair, dark-brown suede jacket), seated"
SAU_B = "@{SAUL_SALCEDO} seen from behind (short black hair, navy-blue quilted vest)"
GER_B = "@{GERONIMO_SALCEDO} seen from behind (wavy dark-brown hair, beige linen shirt), seated"
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

ER = "seated on the RIGHT at the head of the table"
GR = "seated on the RIGHT beside his father at the table"
SL = "standing on the LEFT at the end of the table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Saúl YA hablando, deja el sobre en la mesa, Evodio de espaldas en el borde.
 ("c01", 6, S("c01", "Saúl", f"Medium close-up of {SAU} {PORCH0}, {SL}, talking from the very first frame, bitter, he slaps a plain white envelope down onto the table in front of his father", EVO_B, "RIGHT", "bitter, sarcastic, defiant",
     f"Medium close-up of {SAU} {PORCH}, {SL}, talking from the very first frame, bitter, putting a white envelope on the table", "RIGHT")),
 ("c02", 6, S("c02", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, calm and heavy, he looks at the envelope and then up at his son without touching it", SAU_B, "LEFT", "calm, heavy, warning",
     f"Close-up of {EVO} {PORCH}, {ER}, calm and heavy", "LEFT")),
 ("c03", 6, S("c03", "Saúl", f"Close-up of {SAU} {PORCH0}, {SL}, resentful, jaw tight, pointing with his chin at his younger brother", EVO_B, "RIGHT", "resentful, tight, accusing",
     f"Close-up of {SAU} {PORCH}, {SL}, resentful, jaw tight", "RIGHT")),
 ("c04", 6, S("c04", "Gerónimo", f"Close-up of {GER} {PORCH0}, {GR}, confused and hurt, leaning forward toward his brother", SAU_B, "LEFT", "confused, hurt, rising",
     f"Close-up of {GER} {PORCH}, {GR}, confused and hurt", "LEFT")),
 ("c05", 6, S("c05", "Saúl", f"Close-up of {SAU} {PORCH0}, {SL}, a cold satisfied half-smile at his brother", GER_B, "RIGHT", "cold, satisfied, cutting",
     f"Close-up of {SAU} {PORCH}, {SL}, cold satisfied half-smile", "RIGHT")),
 ("c06", 6, S("c06", "Gerónimo", f"Close-up of {GER} {PORCH0}, {GR}, turning to his father, pleading, his voice tight", EVO_B, "RIGHT", "pleading, tight, upset",
     f"Close-up of {GER} {PORCH}, {GR}, pleading", "LEFT")),
 ("c07", D8("c07"), S("c07", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, he raises one hand slowly and speaks with total authority without raising his voice", GER_B, "RIGHT", "authoritative, slow, cold",
     f"Close-up of {EVO} {PORCH}, {ER}, total authority, one hand raised", "LEFT")),
 ("r1", 6, one(f"Close-up of {EVO} {PORCH}, {ER}, he opens the white envelope, unfolds a sheet of paper and reads in silence, his face unreadable, the paper turned away from the camera, no readable text", "LEFT") + " No dialogue."),
 ("c08", 6, S("c08", "Saúl", f"Close-up of {SAU} {PORCH0}, {SL}, leaning on the table with both hands, triumphant, staring at his father", EVO_B, "RIGHT", "triumphant, cruel, eager",
     f"Close-up of {SAU} {PORCH}, {SL}, leaning on the table, triumphant", "RIGHT")),
 ("c09", 6, S("c09", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, he folds the paper calmly and puts it back in the envelope, serene, looking up at his eldest son", SAU_B, "LEFT", "serene, calm, slow",
     f"Close-up of {EVO} {PORCH}, {ER}, serene, folding the paper", "LEFT")),
 ("c10", 6, S("c10", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, he leans forward, eyes fixed on his eldest son, a cold quiet voice, a short pause between the two questions", SAU_B, "LEFT", "cold, quiet, deadly calm",
     f"Close-up of {EVO} {PORCH}, {ER}, leaning forward, cold and quiet", "LEFT")),
 ("r2", 6, one(f"Close-up of {SAU} {PORCH}, {SL}, frozen, the triumph drains from his face, his lips part, he slowly straightens up, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 ("r3", 6, one(f"Close-up of {GER} {PORCH}, {GR}, stunned, he slowly turns his head from his father to his brother", "LEFT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Evodio a cámara
 ("c11", 10, talk("c11", "Evodio", f"Close-up from the chest up of {EVO} {PORCH}, seated, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, picks up his cream felt cowboy hat and puts it on slowly, strokes his white mustache, raises one eyebrow, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("triumphant, cruel, eager", "triumphant, eager"), ("cold, quiet, deadly calm", "cold, quiet, calm"), ("cruel", "proud"), ("deadly", "very"), ("slaps", "puts"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden afternoon light on the stone porch of a cattle ranch in Guanajuato, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, ranch porch with stone arches in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EVODIO_SALCEDO}", "a stern Mexican rancher in his late sixties with thick white hair, a white mustache and a dark-brown suede jacket"),
         ("@{SAUL_SALCEDO}", "a Mexican man around forty with grey temples, clean-shaven, in a navy-blue quilted vest over a checkered shirt"),
         ("@{GERONIMO_SALCEDO}", "a Mexican man in his early thirties with wavy dark-brown hair, a short beard and a beige linen shirt"),
         (" @{LOC_PORTALPENJAMO}", "")]
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
