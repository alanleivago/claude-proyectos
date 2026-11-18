"""Genera los clips de viajante-sombrerete PARTE 1 (El Viajante de Sombrerete, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #12 "El viajante" [CAPO] (Doble vida y secretos), cierre tipo 1 (entra un personaje inesperado): en la tienda de Sombrerete, Remigio (55) y su socio Baltasar (48) desconfían
del viajante Aurelio (62), que pregunta por las cartas que la gente deja para el patrón. Aurelio encuentra una carta a medio quemar en la estufa. Baltasar va a la hacienda a avisarle al patrón...
y encuentra al viajante sentado en la silla del patrón.
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
# Geografía fija (tienda): Remigio y Baltasar a la DERECHA detrás del mostrador; Aurelio a la IZQUIERDA junto a los costales y la estufa. Despacho: Aurelio sentado en la silla tallada.
YARD0 = ("inside an old general store in Sombrerete, Zacatecas @{LOC_TIENDASOMBRERETE} in the afternoon: a long dark wooden counter, shelves full of jars, sacks of beans and corn, "
         "an old cast-iron wood stove in the corner, hanging lanterns, dusty warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
OFF = ("in the office of an old wealthy hacienda in Zacatecas @{LOC_DESPACHOSOMBRERETE} in the afternoon: a huge carved dark-wood desk, a tall carved wooden chair like a throne, stone walls, "
       "sunlight from a big window, bookshelves; no readable text, no signs, no logos; nobody else in the background, no extras, nobody besides the person described")
AUR = ("@{AURELIO_MONTES} (62-year-old Mexican man, light-brown skin, short salt-and-pepper hair, a neat grey mustache, calm sharp eyes, a worn beige travel jacket over a light-blue shirt, a small grey fedora)")
AUR_RICH = ("@{AURELIO_MONTES} (62-year-old Mexican man, light-brown skin, short salt-and-pepper hair, a neat grey mustache, calm sharp eyes; same face, but now wearing an elegant charcoal three-piece suit with a white shirt, no hat)")
REM = ("@{REMIGIO_PENA} (55-year-old Mexican man, brown skin, balding with black hair on the sides, a round face, a thin black mustache, a white shirt with a brown cardigan vest, reading glasses on a cord)")
BAL = ("@{BALTASAR_RUELAS} (48-year-old Mexican man, light skin, slicked black hair, a sharp hard face, a short black beard, a dark-red western shirt, a black leather jacket)")
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

AUR_B = "@{AURELIO_MONTES} seen from behind (small grey fedora, worn beige travel jacket)"
REM_B = "@{REMIGIO_PENA} seen from behind (balding head with black hair on the sides, brown cardigan vest over a white shirt)"
BAL_B = "@{BALTASAR_RUELAS} seen from behind (slicked black hair, black leather jacket)"
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

RR = "standing on the RIGHT behind the wooden counter"
BR = "standing on the RIGHT behind the counter, next to his partner"
AL = "standing on the LEFT by the sacks of corn, near the old stove"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Remigio YA hablando bajito con Baltasar detrás del mostrador.
 ("c01", 6, S("c01", "Remigio", f"Medium close-up of {REM} {YARD0}, {RR}, talking from the very first frame, whispering, suspicious, glancing sideways toward the back of the store", BAL_B, "LEFT", "whispering, suspicious, nervous",
     f"Medium close-up of {REM} {YARD}, {RR}, talking from the very first frame, whispering and suspicious", "LEFT")),
 ("c02", 6, S("c02", "Baltasar", f"Close-up of {BAL} {YARD0}, {BR}, dismissive, leaning on the counter, a cold smirk", REM_B, "LEFT", "dismissive, cold, low",
     f"Close-up of {BAL} {YARD}, {BR}, dismissive, a cold smirk", "LEFT")),
 ("c03", D8("c03"), S("c03", "Aurelio", f"Close-up of {AUR} {YARD0}, {AL}, polite and friendly, he touches the brim of his fedora", REM_B, "RIGHT", "polite, friendly, curious",
     f"Close-up of {AUR} {YARD}, {AL}, polite and friendly", "RIGHT")),
 ("c04", 6, S("c04", "Remigio", f"Close-up of {REM} {YARD0}, {RR}, a forced nervous smile, rubbing his hands", AUR_B, "LEFT", "nervous, overly friendly",
     f"Close-up of {REM} {YARD}, {RR}, a forced nervous smile", "LEFT")),
 ("c05", 6, S("c05", "Aurelio", f"Close-up of {AUR} {YARD0}, {AL}, calm, a faint ironic smile, studying the man", REM_B, "RIGHT", "calm, ironic, slow",
     f"Close-up of {AUR} {YARD}, {AL}, calm, a faint ironic smile", "RIGHT")),
 ("c06", 6, S("c06", "Baltasar", f"Close-up of {BAL} {YARD0}, {BR}, hostile, he straightens up and points at the door", AUR_B, "LEFT", "hostile, sharp, warning",
     f"Close-up of {BAL} {YARD}, {BR}, hostile", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: the open door of an old cast-iron wood stove, inside among grey ashes a half-burned paper envelope with charred edges and a dark-red wax seal; no readable text, no people, no hands. No dialogue."),
 ("c07", 6, S("c07", "Aurelio", f"Close-up of {AUR} {YARD0}, {AL}, holding up a half-burned envelope with charred edges, calm and serious, his eyes hard now", REM_B, "RIGHT", "calm, serious, cutting",
     f"Close-up of {AUR} {YARD}, {AL}, holding up a half-burned envelope, serious", "RIGHT")),
 ("r1", 6, one(f"Close-up of {REM} {YARD}, {RR}, frozen, his face goes pale, sweat on his forehead, his reading glasses slip from his fingers, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Baltasar", f"Close-up of {BAL} {YARD0}, {BR}, tense and angry, talking low to his partner, he grabs his leather jacket collar", REM_B, "LEFT", "tense, low, decided",
     f"Close-up of {BAL} {YARD}, {BR}, tense, talking low", "LEFT")),
 ("r2", 6, one(f"Medium shot of {BAL} {OFF}, he walks in through the office door confidently, then suddenly stops dead, his confident face turns to shock, staring at the carved chair", "RIGHT") + " No dialogue."),
 ("r3", 6, one(f"Medium shot of {AUR_RICH} {OFF}, seated calmly in the tall carved wooden chair behind the huge desk, hands folded, a slow knowing smile", "LEFT") + " Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Aurelio", ots(f"Close-up of {AUR_RICH} {OFF}, seated in the tall carved wooden chair, calm, powerful, a small smile", BAL_B, "LEFT") + " " + MOUTH("Aurelio", "the listener"), "calm, powerful, ironic")),
 # CTA con carisma (después del BLACK): Aurelio a cámara
 ("c10", 10, talk("c10", "Aurelio", f"Close-up from the chest up of {AUR_RICH} {OFF}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts the lapel of his suit, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile.",
     "charismatic, calm, powerful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("hostile, sharp, warning", "firm, serious"), ("hostile", "unfriendly"), ("tense and angry", "tense"), ("angry", "upset"), ("cutting", "firm"),
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
          "Vertical scene from a Mexican TV drama, realistic, dusty warm afternoon light in an old general store in Zacatecas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican general store, steady camera. Same faces as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{AURELIO_MONTES}", "a Mexican man in his sixties with salt-and-pepper hair and a neat grey mustache"),
         ("@{REMIGIO_PENA}", "a balding round-faced Mexican shopkeeper in his fifties with a thin mustache and a brown cardigan vest"),
         ("@{BALTASAR_RUELAS}", "a hard-faced Mexican man in his late forties with slicked black hair, a short black beard and a black leather jacket"),
         (" @{LOC_TIENDASOMBRERETE}", ""), (" @{LOC_DESPACHOSOMBRERETE}", "")]
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
