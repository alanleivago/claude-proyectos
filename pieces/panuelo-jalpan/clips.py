"""Genera los clips de panuelo-jalpan PARTE 1 (El Pañuelo de Jalpan, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #56 "La señora de la hacienda y el administrador" [CAPO] (Patronas y haciendas), época (1890s, ropa civil de época, sin uniformes), cierre tipo 6 (mirada muda):
en el patio de su hacienda en Jalpan, el hacendado Anastasio (60) le prohíbe al administrador Matías (30) acercarse a su hija Mariana (22), prometida a don Rafael Garduño.
Mariana defiende a Matías; el padre da por cerrado el tema y se va. A sus espaldas, ella le pasa un pañuelo bordado: "Esta noche, en la capilla". El padre se detiene en la puerta y voltea:
una mirada muda entre él y Matías, con el pañuelo en la mano.
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
# Geografía fija (patio): Anastasio a la DERECHA junto al corredor de arcos; Mariana a la DERECHA junto a la fuente, un paso detrás de su padre; Matías a la IZQUIERDA, sombrero en mano.
YARD0 = ("in the inner courtyard of an old 19th-century hacienda in Jalpan, Sierra Gorda of Queretaro @{LOC_HACIENDAJALPAN} in the soft late afternoon, in the 1890s: ochre and white walls, a stone fountain, arched corridors with heavy wooden doors, potted geraniums, "
         "green mountains beyond the roofs; period setting, no modern objects; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ANA = ("@{ANASTASIO_ECHEVERRIA} (60-year-old Mexican man, fair skin, grey hair combed back, thick grey sideburns and a grey mustache, a black 19th-century frock coat over a grey silk waistcoat with a gold watch chain, a black cravat)")
MAR = ("@{MARIANA_ECHEVERRIA} (22-year-old Mexican woman, fair skin, dark-brown hair in an elegant 19th-century updo with loose curls, large dark eyes, a pale-blue high-necked 19th-century dress with white lace collar)")
MAT = ("@{MATIAS_ROBLEDO} (30-year-old Mexican mestizo man, warm brown skin, short black hair, a neat black mustache, a simple brown wool 19th-century jacket over a white collarless shirt, a brown waistcoat)")
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

ANA_B = "@{ANASTASIO_ECHEVERRIA} seen from behind (grey hair combed back, black frock coat)"
MAR_B = "@{MARIANA_ECHEVERRIA} seen from behind (dark-brown 19th-century updo, pale-blue dress)"
MAT_B = "@{MATIAS_ROBLEDO} seen from behind (short black hair, brown wool jacket)"
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

AR = "standing on the RIGHT by the arched corridor"
MR = "standing on the RIGHT by the stone fountain, a step behind her father"
TL = "standing on the LEFT, holding his wide-brimmed palm hat against his chest"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Anastasio YA hablando, duro, Matías de espaldas en el borde.
 ("c01", 6, S("c01", "Anastasio", f"Medium close-up of {ANA} {YARD0}, {AR}, talking from the very first frame, cold and hard, pointing one finger at the administrator", MAT_B, "LEFT", "cold, hard, commanding",
     f"Medium close-up of {ANA} {YARD}, {AR}, talking from the very first frame, cold and hard", "LEFT")),
 ("c02", D8("c02"), S("c02", "Matías", f"Close-up of {MAT} {YARD0}, {TL}, respectful, head slightly bowed but eyes steady", ANA_B, "RIGHT", "respectful, calm, steady",
     f"Close-up of {MAT} {YARD}, {TL}, respectful, eyes steady", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, stern, he adjusts his gold watch chain as he speaks", MAT_B, "LEFT", "stern, cold, final",
     f"Close-up of {ANA} {YARD}, {AR}, stern", "LEFT")),
 ("c04", 6, S("c04", "Mariana", f"Close-up of {MAR} {YARD0}, {MR}, stepping toward her father, eyes wet, pleading", ANA_B, "RIGHT", "pleading, sad, trembling",
     f"Close-up of {MAR} {YARD}, {MR}, eyes wet, pleading", "RIGHT")),
 ("c05", 6, S("c05", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, turning to his daughter, cold and certain, without softening", MAR_B, "LEFT", "cold, certain, proud",
     f"Close-up of {ANA} {YARD}, {AR}, cold and certain", "LEFT")),
 ("c06", D8("c06"), S("c06", "Matías", f"Close-up of {MAT} {YARD0}, {TL}, he lifts his chin, quiet dignity, holding the old man's gaze", ANA_B, "RIGHT", "quiet, dignified, firm",
     f"Close-up of {MAT} {YARD}, {TL}, quiet dignity", "RIGHT")),
 ("c07", 6, S("c07", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, eyes narrowing, a low warning voice", MAT_B, "LEFT", "low, warning, icy",
     f"Close-up of {ANA} {YARD}, {AR}, eyes narrowing, low warning voice", "LEFT")),
 ("c08", D8("c08"), S("c08", "Mariana", f"Close-up of {MAR} {YARD0}, {MR}, brave now, defending him, hands clasped at her waist", ANA_B, "RIGHT", "brave, firm, emotional",
     f"Close-up of {MAR} {YARD}, {MR}, brave, defending him", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, he cuts the conversation with a sharp gesture of his hand, final", MAR_B, "LEFT", "sharp, final, authoritative",
     f"Close-up of {ANA} {YARD}, {AR}, sharp final gesture", "LEFT")),
 ("r1", 6, f"Wide medium shot {YARD0}: {ANA} turns his back and walks away toward the arched corridor on the RIGHT; on the LEFT, behind his back, {MAR} quickly steps to {MAT} and presses a small folded white embroidered handkerchief into his hand, both glancing at the father's back; nobody else, no extras. No dialogue."),
 ("i01", 6, f"Close-up insert {YARD0}: a man's brown hand closing around a small folded white handkerchief embroidered with tiny blue flowers, the sleeve of a brown wool jacket; no faces, no readable text, no letters. No dialogue."),
 ("c10", 6, S("c10", "Mariana", f"Close-up of {MAR} {YARD0}, close to him, whispering urgently, glancing once toward the corridor", MAT_B, "LEFT", "whispering, urgent, tender",
     f"Close-up of {MAR} {YARD}, whispering urgently", "LEFT")),
 ("r2", 6, one(f"Medium close-up of {ANA} {YARD}, standing under an arch of the corridor on the RIGHT, he stops, then slowly turns his head back over his shoulder, his eyes hard and fixed, silent", "LEFT") + " Slow push-in. No dialogue."),
 ("r3", 6, one(f"Close-up of {MAT} {YARD}, {TL}, his hand closed around the small white handkerchief, he holds the gaze in silence, still, not looking away", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Mariana a cámara
 ("c11", 10, talk("c11", "Mariana", f"Close-up from the chest up of {MAR} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, touches a loose curl by her ear, raises one eyebrow, gestures gently with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("low, warning, icy", "low, serious"), ("pleading, sad, trembling", "pleading, sad"), ("icy", "serious"), ("pointing one finger at", "looking at"),
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
          "Vertical scene from a Mexican period TV drama set in the 1890s, realistic, soft late afternoon light in a hacienda courtyard, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical period drama shot, 19th-century hacienda courtyard in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican period drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ANASTASIO_ECHEVERRIA}", "a stern Mexican hacienda owner around sixty with grey sideburns and mustache, in a black 19th-century frock coat"),
         ("@{MARIANA_ECHEVERRIA}", "a young Mexican woman with a dark-brown 19th-century updo and a pale-blue high-necked lace-collar dress"),
         ("@{MATIAS_ROBLEDO}", "a Mexican man around thirty with a neat black mustache, in a simple brown wool 19th-century jacket and waistcoat"),
         (" @{LOC_HACIENDAJALPAN}", "")]
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
