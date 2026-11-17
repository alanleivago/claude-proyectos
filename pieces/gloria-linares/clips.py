"""Genera los clips de gloria-linares PARTE 1 (La Gloria de Linares, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2, saga Evaristo): en Linares, Nuevo León, la nuera Fabiola (38) le hace la maleta a don Abundio (72), el que levantó casa y fábrica de glorias,
para que no lo vea la compradora de Monterrey; su hijo Mauricio (40) la deja. Llega Consuelo (62), la compradora: solo compra las glorias de don Abundio; sin él no hay trato.
Giro: Fabiola le quiso vender a escondidas la libreta de recetas... y Abundio revela que la libreta está en blanco.
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
# Geografía fija (frente de la casa, Linares): de izquierda a derecha Consuelo (llega por el portón, luego al pie de la escalinata), Abundio (al pie de la escalinata con su maleta),
# Mauricio y Fabiola (arriba, en el porche).
YARD0 = ("in front of a large two-story family house in Linares, Nuevo León @{LOC_CASALINARES} in the hot afternoon: wide stone steps up to a covered front porch, a big wooden door, "
         "orange trees in the yard, a small brick candy workshop beside the house, bright sun; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CASE = "an old brown leather suitcase"
ABU = ("@{ABUNDIO_TREVINO} (72-year-old Mexican man, thin, light skin, white hair combed back, a neat white mustache, a blue-and-white checkered western shirt with pearl snaps, "
       "grey trousers, brown boots)")
MAU = ("@{MAURICIO_TREVINO} (40-year-old Mexican man, slightly overweight, light skin, short dark hair, clean-shaven round face, a navy-blue polo shirt, khaki trousers)")
FAB = ("@{FABIOLA_GARZA} (38-year-old Mexican woman, light skin, long straight bleached-blonde hair, heavy makeup, a white sleeveless dress, large sunglasses on her head, "
       "many gold bracelets)")
CON = ("@{CONSUELO_VILLARREAL} (62-year-old elegant Mexican businesswoman, light skin, a short silver bob haircut, pearl earrings, a cream-colored pantsuit)")
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

# Bordes: orden fijo C - A | M - F. Mauricio o Fabiola le hablan a Abundio/Consuelo -> espalda LEFT; Abundio o Consuelo le hablan a Mauricio/Fabiola -> espalda RIGHT;
# Fabiola le habla a Mauricio -> espalda de él LEFT.
ABU_B = "@{ABUNDIO_TREVINO} seen from behind (white hair combed back, blue-and-white checkered western shirt, thin)"
MAU_B = "@{MAURICIO_TREVINO} seen from behind (short dark hair, navy-blue polo shirt, slightly overweight)"
FAB_B = "@{FABIOLA_GARZA} seen from behind (long straight bleached-blonde hair, white sleeveless dress)"
CON_B = "@{CONSUELO_VILLARREAL} seen from behind (short silver bob haircut, cream-colored jacket)"
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

AL = f"standing on the LEFT at the bottom of the stone steps, {CASE} at his feet"            # Abundio
CL = "standing on the LEFT at the bottom of the stone steps"                                 # Consuelo
MR = "standing on the RIGHT at the top of the stone steps, on the porch"                     # Mauricio
FR = "standing on the RIGHT at the top of the stone steps, on the porch, holding a glass of orange juice"  # Fabiola

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fabiola YA hablando arriba de la escalinata; Abundio de espaldas (LEFT) abajo con la maleta. Plazo: antes de que llegue la compradora.
 ("c01", D8("c01"), S("c01", "Fabiola", f"Medium close-up of {FAB} {YARD0}, {FR}, talking from the very first frame, smug, looking down at the old man below", ABU_B, "LEFT", "smug, bossy, cold",
     f"Medium close-up of {FAB} {YARD}, {FR}, talking from the very first frame, smug, looking down", "LEFT")),
 ("c02", D8("c02"), S("c02", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, dignified, he looks up at her", FAB_B, "RIGHT", "dignified, hurt, firm",
     f"Close-up of {ABU} {YARD}, {AL}, dignified, he looks up", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, she sips the juice and smiles coldly", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {MAU} {YARD}, he steps out of the big wooden door onto the porch and stops, uncomfortable, he rubs the back of his neck, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy polo shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, his eyes shine, he looks up at his son", MAU_B, "RIGHT", "hurt, soft, sad",
     f"Close-up of {ABU} {YARD}, {AL}, his eyes shine", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Mauricio", f"Close-up of {MAU} {YARD0}, {MR}, he avoids his father's eyes, uncomfortable", ABU_B, "LEFT", "uncomfortable, quick, embarrassed",
     f"Close-up of {MAU} {YARD}, {MR}, he avoids looking down", "LEFT")),
 ("c06", 6, talk("c06", "Abundio", one(f"Close-up of {ABU} {YARD}, {AL}, quiet, his eyes shine, a sad smile", "RIGHT"), "quiet, sad, slow")),
 ("c07", 6, talk("c07", "Mauricio", one(f"Close-up of {MAU} {YARD}, {MR}, impatient, he waves toward the street", "LEFT"), "impatient, uncomfortable")),
 ("i01", 6, f"Close-up insert {YARD0}: a small wooden box full of round milk candies wrapped in red cellophane resting on a stone step next to {CASE}; only the box and the suitcase, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {ABU} {YARD}, {AL}, he slowly bends down, picks up {CASE} by the handle and straightens up with dignity, "
           f"{SOLO}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("i02", 6, "Wide shot of a white SUV arriving slowly and stopping at an iron gate in front of a large house with orange trees in Linares, Nuevo León, bright afternoon sun; no people visible, no readable text, no logos, no license plate text. No dialogue."),
 ("r3", 6, f"Medium shot of {CON} {YARD}, standing at the iron gate, already in place, a white SUV parked behind her, she slowly takes off dark sunglasses, elegant and serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a cream pantsuit')}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Consuelo", one(f"Close-up of {CON} {YARD}, {CL}, polite and serious, she looks up at the porch", "RIGHT"), "polite, serious, calm")),
 ("c09", 6, S("c09", "Mauricio", f"Close-up of {MAU} {YARD0}, {MR}, a big eager smile, he comes down one step", CON_B, "LEFT", "eager, friendly, quick",
     f"Close-up of {MAU} {YARD}, {MR}, a big eager smile", "LEFT")),
 ("c10", 6, (talk("c10", "Consuelo", two(f"{CON} on the LEFT and {ABU} on the RIGHT holding {CASE}, in profile facing each other at the bottom of the stone steps {YARD0}, "
     f"framed from the waist up; Consuelo, surprised and warm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Consuelo", "Abundio"), "surprised, warm"),
   talk("c10", "Consuelo", one(f"Close-up of {CON} {YARD}, {CL}, surprised and warm", "RIGHT"), "surprised, warm"))),
 ("c11", 6, talk("c11", "Abundio", one(f"Close-up of {ABU} {YARD}, holding {CASE}, humble, a tired smile", "LEFT"), "humble, tired, soft")),
 ("c12", D8("c12"), S("c12", "Consuelo", f"Close-up of {CON} {YARD0}, {CL}, cold and serious, she looks up at the son", MAU_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {CON} {YARD}, {CL}, cold and serious", "RIGHT")),
 ("c13", D8("c13"), S("c13", "Fabiola", f"Close-up of {FAB} {YARD0}, {FR}, a forced polite smile", CON_B, "LEFT", "fake polite, quick",
     f"Close-up of {FAB} {YARD}, {FR}, a forced polite smile", "LEFT")),
 ("c14", 6, S("c14", "Consuelo", f"Close-up of {CON} {YARD0}, {CL}, unimpressed, she shakes her head slowly", FAB_B, "RIGHT", "dry, cold",
     f"Close-up of {CON} {YARD}, {CL}, unimpressed", "RIGHT")),
 ("c15", D8("c15"), talk("c15", "Abundio", one(f"Close-up of {ABU} {YARD}, holding {CASE}, calm and wise, a small knowing smile", "RIGHT"), "calm, wise, slow")),
 ("c16", 6, (talk("c16", "Consuelo", f"Medium wide group shot {YARD0}: {CON} and {ABU} standing at the bottom of the stone steps on the LEFT, {MAU} and {FAB} on the porch at the top on the RIGHT; "
     f"Consuelo, firm, speaks looking up at the couple, closest to the camera and in sharp focus; only these four people, no extras. Only Consuelo speaks: her lips move clearly; the other three stay silent with mouths closed.", "firm, final, calm"),
   talk("c16", "Consuelo", one(f"Close-up of {CON} {YARD}, {CL}, firm and final", "RIGHT"), "firm, final, calm"))),
 ("c17", D8("c17"), S("c17", "Mauricio", f"Close-up of {MAU} {YARD0}, {MR}, ashamed, he comes down the steps reaching out a hand", ABU_B, "LEFT", "ashamed, pleading, quick",
     f"Close-up of {MAU} {YARD}, {MR}, ashamed", "LEFT")),
 ("c18", D8("c18"), S("c18", "Abundio", f"Close-up of {ABU} {YARD0}, holding {CASE}, dignified and calm, his eyes shine", MAU_B, "RIGHT", "dignified, calm, hurt",
     f"Close-up of {ABU} {YARD}, holding {CASE}, dignified, his eyes shine", "RIGHT")),
 ("c19", 6, talk("c19", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, she rolls her eyes and mutters to herself", "LEFT"), "annoyed, low, mocking")),
 ("c20", D8("c20"), S("c20", "Consuelo", f"Close-up of {CON} {YARD0}, {CL}, she raises one eyebrow, calm and sharp", FAB_B, "RIGHT", "calm, sharp, slow",
     f"Close-up of {CON} {YARD}, {CL}, she raises one eyebrow", "RIGHT")),
 ("r4", 6, one(f"Close-up of {MAU} {YARD}, standing on the porch, in silence, he slowly turns his head to his wife, stunned, his mouth half open", "RIGHT") + " Slow push-in. No dialogue."),
 ("c21", 6, (talk("c21", "Mauricio", two(f"{MAU} on the LEFT and {FAB} on the RIGHT, in profile facing each other on the porch {YARD0}, framed from the waist up; "
     f"Mauricio, shocked and hurt, slightly closer to the camera and in sharper focus") + " " + MOUTH("Mauricio", "Fabiola"), "shocked, hurt"),
   talk("c21", "Mauricio", one(f"Close-up of {MAU} {YARD}, standing on the porch, shocked and hurt", "RIGHT"), "shocked, hurt"))),
 ("c22", 6, S("c22", "Fabiola", f"Close-up of {FAB} {YARD0}, standing on the RIGHT on the porch, cold, she shrugs", MAU_B, "LEFT", "cold, careless",
     f"Close-up of {FAB} {YARD}, standing on the RIGHT on the porch, cold, she shrugs", "LEFT")),
 ("c23", D8("c23"), talk("c23", "Abundio", one(f"Close-up of {ABU} {YARD}, holding {CASE}, calm, a small satisfied smile", "RIGHT"), "calm, satisfied, slow")),
 # CTA con carisma (después del BLACK): Abundio solo, a cámara
 ("c24", 10, talk("c24", "Abundio", f"Close-up from the chest up of {ABU} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small mischievous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Tu papá ya no va a durar mucho.", "Tu papá ya está muy grande."), ("huele a viejo", "huele a polvo"),
        ("Lo que pesa es lo que me hiciste.", "Lo que pesa es otra cosa."), ("stunned", "surprised"), ("shocked and hurt", "surprised"),
        ("fake polite", "polite"), ("mutters to herself", "speaks low"),
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
          "Vertical scene from a Mexican TV drama, realistic, bright afternoon sun in front of a large family house with stone steps in Nuevo León, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, front porch and stone steps of a family house with orange trees in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ABUNDIO_TREVINO}", "a thin elderly Mexican man with white combed-back hair, a white mustache and a blue-and-white checkered western shirt"),
         ("@{MAURICIO_TREVINO}", "a slightly overweight Mexican man in his forties with short dark hair and a navy-blue polo shirt"),
         ("@{FABIOLA_GARZA}", "a Mexican woman in her thirties with long bleached-blonde hair, heavy makeup and a white sleeveless dress"),
         ("@{CONSUELO_VILLARREAL}", "an elegant Mexican woman in her sixties with a short silver bob and a cream-colored pantsuit"),
         (" @{LOC_CASALINARES}", "")]
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
