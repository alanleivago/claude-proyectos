"""Genera los clips de barrica-valle PARTE 1 (La Barrica del Valle, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (patrón acusa a su hombre de confianza -> plazo -> aparece la prueba -> el traidor es de la familia -> plazo invertido): en la cava de una vinícola del Valle de Guadalupe,
don Leopoldo Garza (67) acusa a su capataz Cirilo (56), veinte años a su lado, de abrir las barricas; su yerno Esteban (35) lo señala. La esposa Amparo (62) encuentra la llave perdida en la
chamarra de Esteban. Giro: Esteban no se apellida Salinas, es un Montaño, la familia rival. Leopoldo le pide perdón a Cirilo y le da a Esteban hasta mañana para irse.
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
# Geografía fija (cava): Cirilo y Esteban a la IZQUIERDA (entre las barricas); Leopoldo y Amparo a la DERECHA (junto a la puerta en arco).
YARD0 = ("inside the stone wine cellar of a family winery in Valle de Guadalupe, Baja California @{LOC_CAVAVALLE} in the evening: rows of oak wine barrels on wooden racks, "
         "a wet stone floor, warm hanging lamps, an arched wooden door open to vineyard rows at dusk; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
KEY = "an old black iron key"
LEO = ("@{LEOPOLDO_GARZA} (67-year-old Mexican man, tall and heavy-set, light skin, thick silver hair combed back, a full grey beard, a dark-brown suede jacket over a black shirt)")
CIR = ("@{CIRILO_BUSTOS} (56-year-old Mexican man, dark-brown sun-tanned skin, short black hair grey at the temples, a black mustache, a faded denim work shirt, a beige wide-brim work hat)")
AMP = ("@{AMPARO_GARZA} (62-year-old Mexican woman, light-brown skin, shoulder-length grey-blond hair, pearl stud earrings, a cream wool cardigan over a navy-blue blouse)")
EST = ("@{ESTEBAN_SALINAS} (35-year-old Mexican man, fair skin, neat short light-brown hair, clean-shaven, a tan leather jacket over a black turtleneck)")
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

# Bordes: Leopoldo o Amparo le hablan a Cirilo/Esteban -> espalda LEFT; Cirilo o Esteban le hablan a Leopoldo/Amparo -> espalda RIGHT.
LEO_B = "@{LEOPOLDO_GARZA} seen from behind (thick silver hair, dark-brown suede jacket, heavy-set)"
CIR_B = "@{CIRILO_BUSTOS} seen from behind (beige wide-brim work hat, faded denim work shirt)"
AMP_B = "@{AMPARO_GARZA} seen from behind (shoulder-length grey-blond hair, cream wool cardigan)"
EST_B = "@{ESTEBAN_SALINAS} seen from behind (neat short light-brown hair, tan leather jacket)"
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

CL = "standing on the LEFT between the rows of barrels"            # Cirilo
EL = "standing on the LEFT, leaning on a wine barrel"              # Esteban
LR = "standing on the RIGHT near the arched wooden door"           # Leopoldo
AR = "standing on the RIGHT by the arched wooden door"             # Amparo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Leopoldo YA hablando en la cava; Cirilo de espaldas (LEFT).
 ("c01", 6, S("c01", "Leopoldo", f"Medium close-up of {LEO} {YARD0}, {LR}, talking from the very first frame, grave and hard, he slaps the top of a barrel with his open hand", CIR_B, "LEFT", "grave, hard, contained anger",
     f"Medium close-up of {LEO} {YARD}, {LR}, talking from the very first frame, grave and hard", "LEFT")),
 ("c02", 6, S("c02", "Cirilo", f"Close-up of {CIR} {YARD0}, {CL}, worried and sincere, he takes off his hat", LEO_B, "RIGHT", "worried, sincere",
     f"Close-up of {CIR} {YARD}, {CL}, worried and sincere", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Leopoldo", one(f"Close-up of {LEO} {YARD}, {LR}, disappointed and cold, his eyes shine", "LEFT"), "disappointed, cold, slow")),
 ("r1", 6, f"Medium shot of {EST} {YARD}, {EL}, already in place, arms crossed, a faint calculating smile that disappears, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a tan leather jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Esteban", f"Close-up of {EST} {YARD0}, {EL}, pretending to be sorry, soft voice", LEO_B, "RIGHT", "falsely sorry, soft",
     f"Close-up of {EST} {YARD}, {EL}, pretending to be sorry", "RIGHT")),
 ("c05", D8("c05"), talk("c05", "Cirilo", one(f"Close-up of {CIR} {YARD}, {CL}, hurt and surprised, holding his hat against his chest", "LEFT"), "hurt, surprised")),
 ("c06", 6, S("c06", "Leopoldo", f"Close-up of {LEO} {YARD0}, {LR}, cold and final, he holds out his open hand", CIR_B, "LEFT", "cold, final",
     f"Close-up of {LEO} {YARD}, {LR}, cold and final, he holds out his open hand", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {KEY} lies on top of an oak wine barrel under the warm lamp light; only the key and the barrel, no face, no hands, no people. No dialogue."),
 ("c07", 6, S("c07", "Cirilo", f"Close-up of {CIR} {YARD0}, {CL}, dignified, his eyes shine, he puts his hat back on", LEO_B, "RIGHT", "dignified, sad, low",
     f"Close-up of {CIR} {YARD}, {CL}, dignified, his eyes shine", "RIGHT")),
 ("r2", 6, f"Medium shot of {AMP} {YARD}, {AR}, already in place in the doorway, serious and decided, holding {KEY} up in one hand, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a cream cardigan')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Amparo", two(f"{AMP} on the RIGHT holding {KEY} up and {LEO} on the LEFT, close together by the arched door {YARD0}, framed from the waist up; "
     f"Amparo speaks firmly to her husband, slightly closer to the camera and in sharper focus") + " " + MOUTH("Amparo", "Leopoldo"), "firm, urgent"),
   talk("c08", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, firm, holding {KEY} up", "LEFT"), "firm, urgent"))),
 ("c09", 6, S("c09", "Esteban", f"Close-up of {EST} {YARD0}, {EL}, nervous, forcing a smile, he raises his palms", AMP_B, "RIGHT", "nervous, defensive",
     f"Close-up of {EST} {YARD}, {EL}, nervous, forcing a smile", "RIGHT")),
 ("c10", D8("c10"), S("c10", "Leopoldo", f"Close-up of {LEO} {YARD0}, {LR}, suspicious, his eyes narrow", EST_B, "LEFT", "suspicious, low, hard",
     f"Close-up of {LEO} {YARD}, {LR}, suspicious, his eyes narrow", "LEFT")),
 ("i02", 6, "Wide shot of vineyard rows at dusk in Valle de Guadalupe, Baja California, a dark SUV with its headlights on parked and waiting at the ranch gate; no people visible, no readable text, no logos. No dialogue."),
 ("c11", 6, talk("c11", "Esteban", one(f"Close-up of {EST} {YARD}, {EL}, his nervous smile turns cold, he straightens up", "RIGHT"), "cold, calm, cynical")),
 ("c12", 6, talk("c12", "Leopoldo", one(f"Close-up of {LEO} {YARD}, {LR}, stunned, then hard", "LEFT"), "stunned, hard")),
 ("c13", 6, S("c13", "Esteban", f"Close-up of {EST} {YARD0}, {EL}, a cold proud half smile", LEO_B, "RIGHT", "cold, proud, slow",
     f"Close-up of {EST} {YARD}, {EL}, a cold proud half smile", "RIGHT")),
 ("r3", 6, one(f"Close-up of {LEO} {YARD}, {LR}, in silence, stunned, he closes his eyes, his jaw tightens", "LEFT") + " Slow push-in. No dialogue."),
 ("c14", 6, (talk("c14", "Leopoldo", two(f"{CIR} on the LEFT and {LEO} on the RIGHT, facing each other in profile among the barrels {YARD0}, framed from the waist up; "
     f"Leopoldo, ashamed, puts a hand on the foreman's shoulder, slightly closer to the camera and in sharper focus") + " " + MOUTH("Leopoldo", "Cirilo"), "ashamed, sincere, low"),
   talk("c14", "Leopoldo", one(f"Close-up of {LEO} {YARD}, {LR}, ashamed and sincere", "LEFT"), "ashamed, sincere, low"))),
 ("c15", 6, S("c15", "Cirilo", f"Close-up of {CIR} {YARD0}, {CL}, loyal and serious, a short nod", LEO_B, "RIGHT", "loyal, serious",
     f"Close-up of {CIR} {YARD}, {CL}, loyal and serious", "RIGHT")),
 ("c16", 6, talk("c16", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, worried, her eyes shine", "LEFT"), "worried, sad, low")),
 ("c17", 6, S("c17", "Leopoldo", f"Close-up of {LEO} {YARD0}, {LR}, cold and final, he gestures toward the door", EST_B, "LEFT", "cold, final, slow",
     f"Close-up of {LEO} {YARD}, {LR}, cold and final", "LEFT")),
 # CTA con carisma (después del BLACK): Leopoldo solo, a cámara
 ("c18", 10, talk("c18", "Leopoldo", f"Close-up from the chest up of {LEO} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, strokes his grey beard, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small hard half smile. Nobody else around.",
     "charismatic, grave, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Esto la va a destrozar.", "Esto le va a doler mucho."), ("contained anger", "serious"), ("slaps the top of a barrel with his open hand", "rests his hand on a barrel"),
        ("cynical", "calm"), ("calculating", "small"), ("contemptuous", "cool"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm lamp light in the stone wine cellar of a family winery in Baja California, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, wine cellar with oak barrels in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm low light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LEOPOLDO_GARZA}", "a tall heavy-set Mexican man in his sixties with thick silver hair combed back, a full grey beard and a dark-brown suede jacket"),
         ("@{CIRILO_BUSTOS}", "a Mexican man in his fifties with dark sun-tanned skin, a black mustache, a faded denim work shirt and a beige wide-brim work hat"),
         ("@{AMPARO_GARZA}", "a Mexican woman in her sixties with shoulder-length grey-blond hair, pearl earrings and a cream wool cardigan"),
         ("@{ESTEBAN_SALINAS}", "a Mexican man in his thirties with neat short light-brown hair, clean-shaven, in a tan leather jacket over a black turtleneck"),
         (" @{LOC_CAVAVALLE}", "")]
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
