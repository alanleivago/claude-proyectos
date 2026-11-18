"""Genera los clips de jima-arandas PARTE 1 (La Jimadora de Arandas, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #46 "La recolectora y el heredero" [CAPO] (Patronas y haciendas), cierre tipo 3 (palabra reveladora: el apellido): en el campo de agave de su hacienda tequilera en Arandas,
la jimadora Marisol (28) corrige al heredero Santiago (34). La matriarca doña Graciela (64) la pone en su lugar; Marisol dice que su madre Eugenia jimó para don Rodrigo, el esposo de Graciela.
Graciela palidece, le pide su nombre completo: "Marisol Olmos, señora. Como usted."
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
# Geografía fija (campo): Graciela y Santiago a la DERECHA entre los surcos; Marisol a la IZQUIERDA junto a unas piñas recién cortadas.
YARD0 = ("in a blue agave field of an old tequila hacienda in the highlands of Arandas, Jalisco @{LOC_AGAVEARANDAS} in the morning: long rows of blue-grey agave plants on red earth, "
         "a few freshly harvested agave hearts on the ground, the white hacienda house with a bell tower far in the background, soft morning light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
GRA = ("@{GRACIELA_OLMOS} (64-year-old Mexican woman, fair skin, grey hair in a tight low bun, a stern face, a black silk blouse, a burgundy rebozo over her shoulders, a strand of pearls)")
SAN = ("@{SANTIAGO_OLMOS} (34-year-old Mexican man, light skin, short brown hair, a short trimmed beard, a white linen shirt with rolled sleeves, a light straw hat)")
MAR = ("@{MARISOL_OLMOS} (28-year-old Mexican woman, warm brown skin, long black hair in a single thick braid, a worn wide straw hat, a faded light-blue denim shirt, a red bandana around her neck)")
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

GRA_B = "@{GRACIELA_OLMOS} seen from behind (grey hair in a tight low bun, burgundy rebozo over a black blouse)"
SAN_B = "@{SANTIAGO_OLMOS} seen from behind (light straw hat, white linen shirt)"
MAR_B = "@{MARISOL_OLMOS} seen from behind (long black braid, worn wide straw hat, faded light-blue denim shirt)"
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

GR = "standing on the RIGHT between the agave rows"
SR = "standing on the RIGHT among the agave plants"
ML = "standing on the LEFT next to freshly cut agave hearts"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Marisol YA hablando, Santiago de espaldas en el borde.
 ("c01", 6, S("c01", "Marisol", f"Medium close-up of {MAR} {YARD0}, {ML}, talking from the very first frame, frank and direct, pointing down at an agave heart", SAN_B, "RIGHT", "frank, direct, confident",
     f"Medium close-up of {MAR} {YARD}, {ML}, talking from the very first frame, frank and direct", "RIGHT")),
 ("c02", 6, S("c02", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, surprised and half amused, a crooked smile", MAR_B, "LEFT", "surprised, amused, teasing",
     f"Close-up of {SAN} {YARD}, {SR}, surprised and half amused", "LEFT")),
 ("c03", D8("c03"), S("c03", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, proud, she shows with a flat open hand the angle of the cut", SAN_B, "RIGHT", "proud, patient, firm",
     f"Close-up of {MAR} {YARD}, {ML}, proud, showing with a flat open hand", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: a harvested blue agave heart lying on the red earth, its leaves cut off unevenly and roughly, morning light; no people, no hands, no tools. No dialogue."),
 ("c04", 6, S("c04", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, cold and severe, she lifts her chin, talking to her son", MAR_B, "LEFT", "cold, severe, commanding",
     f"Close-up of {GRA} {YARD}, {GR}, cold and severe", "LEFT")),
 ("c05", 6, S("c05", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, embarrassed but honest, he gestures toward the agave on the ground", GRA_B, "LEFT", "honest, a bit embarrassed",
     f"Close-up of {SAN} {YARD}, {SR}, embarrassed but honest", "LEFT")),
 ("c06", 6, S("c06", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, contemptuous, she adjusts her rebozo without looking at her", MAR_B, "LEFT", "contemptuous, icy, slow",
     f"Close-up of {GRA} {YARD}, {GR}, contemptuous, adjusting her rebozo", "LEFT")),
 ("c07", D8("c07"), S("c07", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, dignified, eyes shining but steady, she takes off her straw hat and holds it", GRA_B, "RIGHT", "dignified, contained, low",
     f"Close-up of {MAR} {YARD}, {ML}, dignified, holding her straw hat", "RIGHT")),
 ("c08", 6, S("c08", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, suddenly curious, a flicker of unease, her eyes narrow", MAR_B, "LEFT", "curious, suspicious, slower",
     f"Close-up of {GRA} {YARD}, {GR}, suddenly curious and uneasy", "LEFT")),
 ("c09", 6, S("c09", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, calm, holding her gaze, soft voice", GRA_B, "RIGHT", "calm, soft, meaningful",
     f"Close-up of {MAR} {YARD}, {ML}, calm, holding her gaze", "RIGHT")),
 ("r1", 6, one(f"Close-up of {GRA} {YARD}, {GR}, frozen, her face slowly goes pale, her hand tightens on her rebozo, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, worried, looking at his mother", GRA_B, "LEFT", "worried, gentle",
     f"Close-up of {SAN} {YARD}, {SR}, worried", "LEFT")),
 ("c11", 6, S("c11", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, tense, her voice low and slow, staring at the young woman", MAR_B, "LEFT", "tense, low, demanding",
     f"Close-up of {GRA} {YARD}, {GR}, tense, staring ahead", "LEFT")),
 ("c12", 6, talk("c12", "Marisol", two(f"{MAR} on the LEFT and {GRA} on the RIGHT {YARD0}, framed from the waist up; the young woman puts her straw hat back on and answers serenely, looking her in the eye, "
     f"the older woman stands frozen") + " " + MOUTH("Marisol", "Graciela"), "serene, slow, firm")),
 ("r2", 6, one(f"Close-up of {SAN} {YARD}, {SR}, stunned, his eyes move slowly from his mother to the young woman, his lips part, no words", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Marisol a cámara
 ("c13", 10, talk("c13", "Marisol", f"Close-up from the chest up of {MAR} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serene, makes a short pause, touches the brim of her straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small proud smile. Nobody else around.",
     "charismatic, proud, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous, icy", "cool"), ("contemptuous", "cool"), ("severe", "firm"), ("icy", "cold"), ("teasing", "light"),
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
          "Vertical scene from a Mexican TV drama, realistic, soft morning light in a blue agave field of a tequila hacienda in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, blue agave field in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GRACIELA_OLMOS}", "a stern Mexican woman in her sixties with grey hair in a tight bun, a black blouse, a burgundy rebozo and pearls"),
         ("@{SANTIAGO_OLMOS}", "a Mexican man in his thirties with a short beard, a white linen shirt and a light straw hat"),
         ("@{MARISOL_OLMOS}", "a Mexican woman in her late twenties with a thick black braid, a worn straw hat, a faded denim shirt and a red bandana"),
         (" @{LOC_AGAVEARANDAS}", "")]
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
