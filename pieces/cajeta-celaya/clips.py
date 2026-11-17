"""Genera los clips de cajeta-celaya PARTE 1 (La Cajeta de Celaya, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2): en Celaya, Leticia (45) le avisa a su padre don Rogaciano (74) que ella y su hermano ya vendieron la fábrica de cajeta y que se tiene que salir
"antes de que acabe el mes" a un cuarto atrás. Llega el comprador, el licenciado Mendoza (50): Rogaciano revela que la fábrica y la receta siguen a su nombre. Giro: los hijos ya se gastaron
el anticipo de una venta que no era suya.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
# Geografía fija (fábrica): Rogaciano a la IZQUIERDA junto a su cazo de cobre; Leticia y el licenciado Mendoza a la DERECHA (junto a la puerta al patio).
YARD0 = ("inside a small family cajeta factory beside a house in Celaya, Guanajuato @{LOC_FABRICACAJETA} in the afternoon: big copper cazos of bubbling caramel, wooden paddles, rows of small round wooden boxes, "
         "white tiled walls, an open door to a patio with a jacaranda tree, warm light; no readable text, no signs, no labels, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PADDLE = "a long wooden paddle"
ROG = ("@{ROGACIANO_LEON} (74-year-old Mexican man, small and thin, light-brown wrinkled skin, white hair combed to the side, a thin white mustache, a white collared shirt under a brown knitted button-front vest)")
LET = ("@{LETICIA_LEON} (45-year-old Mexican woman, light skin, short straight black bob haircut, red lipstick, a cream blazer over a black blouse, gold earrings)")
MEN = ("@{LIC_MENDOZA} (50-year-old Mexican man, light-brown skin, short grey hair, rectangular glasses, clean-shaven, a light-grey suit with a white shirt and a dark-blue tie)")
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

# Bordes: Leticia o Mendoza le hablan a Rogaciano -> espalda de él LEFT; Rogaciano les habla -> espalda RIGHT. Mendoza le habla a Leticia: espalda de ella LEFT (ella queda a su izquierda).
ROG_B = "@{ROGACIANO_LEON} seen from behind (white hair combed to the side, brown knitted vest over a white shirt, small and thin)"
LET_B = "@{LETICIA_LEON} seen from behind (short straight black bob haircut, cream blazer)"
MEN_B = "@{LIC_MENDOZA} seen from behind (short grey hair, light-grey suit jacket)"
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

RL = f"standing on the LEFT beside a big copper cazo of caramel, holding {PADDLE}"     # Rogaciano
LR = "standing on the RIGHT, holding a folder of papers"                                # Leticia
MR = "standing on the RIGHT in the open doorway to the patio, holding a black briefcase"   # Mendoza

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Leticia YA hablando con su carpeta; Rogaciano de espaldas (LEFT) moviendo la cajeta.
 ("c01", D8("c01"), S("c01", "Leticia", f"Medium close-up of {LET} {YARD0}, {LR}, her lips already moving and talking from the very first frame, mouth clearly opening on every word, cold and practical, she taps the folder", ROG_B, "LEFT", "cold, practical, bossy",
     f"Medium close-up of {LET} {YARD}, {LR}, talking from the very first frame, cold and practical", "LEFT")),
 ("c02", D8("c02"), S("c02", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, he stops stirring, hurt and stunned", LET_B, "RIGHT", "hurt, stunned, slow",
     f"Close-up of {ROG} {YARD}, {RL}, hurt and stunned", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Leticia", one(f"Close-up of {LET} {YARD}, {LR}, a cold polite smile", "LEFT"), "cold, polite, impatient")),
 ("r1", 6, f"Medium shot of {ROG} {YARD}, {RL}, in silence, he slowly lays the wooden paddle across the copper cazo and looks around the factory, his eyes shine, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a brown vest')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, sad and dignified", LET_B, "RIGHT", "sad, dignified",
     f"Close-up of {ROG} {YARD}, {RL}, sad and dignified", "RIGHT")),
 ("c05", 6, S("c05", "Leticia", f"Close-up of {LET} {YARD0}, {LR}, careless, she checks her watch", ROG_B, "LEFT", "careless, cold",
     f"Close-up of {LET} {YARD}, {LR}, careless", "LEFT")),
 ("c06", 6, talk("c06", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, his eyes shine, a bitter small smile", "RIGHT"), "bitter, soft, slow")),
 ("i01", 6, f"Close-up insert {YARD0}: thick golden-brown caramel bubbling slowly in a big copper cazo, a wooden paddle resting across it; only the cazo and the caramel, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {MEN} {YARD}, {MR}, already standing in place, he looks around the factory with a polite professional smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey suit')}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Mendoza", one(f"Close-up of {MEN} {YARD}, {MR}, polite and professional", "LEFT"), "polite, professional")),
 ("c08", 6, S("c08", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, surprised, then calm, he studies the man", MEN_B, "RIGHT", "surprised, calm",
     f"Close-up of {ROG} {YARD}, {RL}, surprised, then calm", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Mendoza", f"Close-up of {MEN} {YARD0}, {MR}, polite, he adjusts his glasses", ROG_B, "LEFT", "polite, slightly confused",
     f"Close-up of {MEN} {YARD}, {MR}, polite", "LEFT")),
 ("c10", 6, talk("c10", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, calm and firm", "RIGHT"), "calm, firm")),
 ("c11", D8("c11"), talk("c11", "Leticia", one(f"Close-up of {LET} {YARD}, {LR}, nervous, a forced smile", "LEFT"), "nervous, quick")),
 ("c12", D8("c12"), (talk("c12", "Rogaciano", two(f"{ROG} on the LEFT and {MEN} on the RIGHT, facing each other beside the copper cazo {YARD0}, framed from the waist up; "
     f"Rogaciano, calm and sure, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rogaciano", "Mendoza"), "calm, sure, slow"),
   talk("c12", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, calm and sure", "RIGHT"), "calm, sure, slow"))),
 ("r3", 6, one(f"Close-up of {LET} {YARD}, {LR}, in silence, pale, she grips the folder tightly", "LEFT") + " Slow push-in. No dialogue."),
 ("c13", D8("c13"), S("c13", "Leticia", f"Close-up of {LET} {YARD0}, {LR}, shocked and angry", ROG_B, "LEFT", "shocked, upset",
     f"Close-up of {LET} {YARD}, {LR}, shocked", "LEFT")),
 ("c14", D8("c14"), S("c14", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, firm, a small sure smile", LET_B, "RIGHT", "firm, sure, slow",
     f"Close-up of {ROG} {YARD}, {RL}, firm, a small sure smile", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Mendoza", f"Close-up of {MEN} {YARD0}, {MR}, serious now, he turns to the daughter", LET_B, "LEFT", "serious, cold",
     f"Close-up of {MEN} {YARD}, {MR}, serious", "LEFT")),
 ("r4", 6, one(f"Close-up of {ROG} {YARD}, {RL}, in silence, stunned, he slowly turns his head to his daughter", "RIGHT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, hurt and disappointed, his voice low", "RIGHT"), "hurt, low, disappointed")),
 # CTA con carisma (después del BLACK): Rogaciano solo, a cámara
 ("c17", 10, talk("c17", "Rogaciano", f"Close-up from the chest up of {ROG} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his thin mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small mischievous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y el anticipo que les di, ¿dónde está?", "Y lo que les adelanté, ¿dónde está?"), ("¿Qué anticipo, Leticia?", "¿Qué adelanto, Leticia?"),
        ("¿Ya se gastaron un dinero que no era suyo?", "¿Ya se gastaron algo que no era suyo?"), ("Con lo de la venta nos repartimos todo.", "Y nosotros nos encargamos de todo."),
        ("shocked and angry", "surprised"), ("shocked", "surprised"), ("stunned", "surprised"), ("bitter", "sad"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light inside a small family cajeta factory with copper pots in Celaya, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic Mexican candy workshop with big copper pots of caramel, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROGACIANO_LEON}", "a small thin elderly Mexican man with white combed hair, a thin white mustache and a brown knitted vest"),
         ("@{LETICIA_LEON}", "a Mexican woman in her forties with a short black bob, red lipstick and a cream blazer"),
         ("@{LIC_MENDOZA}", "a Mexican businessman around fifty with grey hair, rectangular glasses and a light-grey suit"),
         (" @{LOC_FABRICACAJETA}", "")]
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
