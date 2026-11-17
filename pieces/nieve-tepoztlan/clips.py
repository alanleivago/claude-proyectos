"""Genera los clips de nieve-tepoztlan PARTE 1 (La Nevería de Tepoztlán, MEXI STORIES, cuenta @mexitve) con Omni Flash por el Flow MCP (CLI), uno por uno.
Variante transformada de la saga de don Evaristo de @atriumstories_ ("Su propio hijo le cerró la puerta", 7706224426399829279, 342K; padre-hijos-herencia):
en la nevería de Tepoztlán, Morelos, la nuera Lizbeth le hace la maleta al suegro Wenceslao (73) para mandarlo al asilo "antes de que cierre el tianguis" y ya mandó hacer el letrero
"Nieves Lizbeth"; el hijo Edmundo la deja. Giro: llega la licenciada Montserrat con los papeles: el local, la receta y el nombre son de Wenceslao y falta poner a nombre de quién quedan.
Copia del clips.py de rebozo-santamaria (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
# Geografía fija (nevería de pueblo en Tepoztlán, Morelos): Wenceslao a la IZQUIERDA en la garrafa de cobre metida en la tina de hielo;
# Lizbeth a la DERECHA detrás del mostrador de azulejo, Edmundo a la DERECHA junto a ella; la licenciada Montserrat entra por la puerta de la calle (centro-derecha) desde r4.
YARD0 = ("inside a small traditional ice cream parlor on a cobbled street in Tepoztlán, Morelos @{LOC_NEVERIATEPOZ} in the afternoon: a counter of hand-painted tiles, "
         "a hand-cranked copper ice cream pail set in a wooden tub of crushed ice, metal tubs of colorful ice cream, an open door to the cobbled street with the green Tepozteco mountain far behind, "
         "papel picado garlands, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PAIL = "a hand-cranked copper ice cream pail in a wooden tub of crushed ice"
PADDLE = "a long wooden paddle"
SUITCASE = "an old brown leather suitcase"
FOLDER = "a brown leather document folder"
WEN = ("@{WENCESLAO_SALGADO} (73-year-old Mexican man, thin, dark brown wrinkled skin, short white hair, a neat white mustache, a white guayabera, a long white apron, "
       "beige cotton trousers, brown huarache sandals)")
LIZ = ("@{LIZBETH_BERMUDEZ} (40-year-old Mexican woman, light skin, long straight dark-brown hair with honey highlights, perfect eyebrows, red lipstick, "
       "a tight turquoise blouse, white jeans, gold necklace)")
EDM = ("@{EDMUNDO_SALGADO} (46-year-old Mexican man, chubby, brown skin, slicked-back black hair, a black goatee, a navy-blue polo shirt, grey trousers, a silver watch)")
MON = ("@{MONTSERRAT_NOTARIA} (50-year-old Mexican woman, brown skin, short grey hair in a neat pixie cut, small silver earrings, thin black glasses, "
       "a navy-blue skirt suit, a white blouse)")
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

# Bordes: Lizbeth, Edmundo o Montserrat le hablan a Wenceslao -> espalda de Wenceslao LEFT; Wenceslao les habla -> espalda de Lizbeth o de Edmundo RIGHT.
WEN_B = "@{WENCESLAO_SALGADO} seen from behind (short white hair, white guayabera, the ties of a long white apron at his back, thin)"
LIZ_B = "@{LIZBETH_BERMUDEZ} seen from behind (long straight dark-brown hair with honey highlights, tight turquoise blouse)"
EDM_B = "@{EDMUNDO_SALGADO} seen from behind (slicked-back black hair, navy-blue polo shirt, chubby)"
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

WL = f"standing on the LEFT beside {PAIL}"                                         # Wenceslao
LR = f"standing on the RIGHT behind the hand-painted tile counter"                 # Lizbeth
ER = f"standing on the RIGHT behind the hand-painted tile counter, car keys in his hand"  # Edmundo
MR = f"standing on the RIGHT just inside the open street door, holding {FOLDER}"   # Montserrat

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Lizbeth YA hablando con la maleta vieja del suegro; Wenceslao de espaldas en la garrafa (LEFT). Plazo: antes de que cierre el tianguis.
 ("c01", 6, S("c01", "Lizbeth", f"Medium shot of {LIZ} {YARD0}, {LR}, {SUITCASE} on the counter beside her, talking from the very first frame, she pats the suitcase, cold and bossy",
     WEN_B + ", turning the crank of the copper ice cream pail", "LEFT", "cold, bossy, mocking",
     f"Medium shot of {LIZ} {YARD}, {LR}, {SUITCASE} on the counter beside her, talking from the very first frame, she pats the suitcase", "LEFT")),
 ("r1", 6, f"Medium shot of {WEN} {YARD}, {WL}, already in place, his hand on the crank of the copper pail, he stops turning it and straightens up slowly, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a white apron')}. Slow push-in. No dialogue."),
 ("c02", 6, S("c02", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, hurt and firm, he lifts his weathered hands", LIZ_B, "RIGHT", "hurt, firm, slow",
     f"Close-up of {WEN} {YARD}, {WL}, hurt and firm, he lifts his weathered hands", "RIGHT")),
 ("c03", 6, talk("c03", "Lizbeth", one(f"Close-up of {LIZ} {YARD}, {LR}, she shrugs with a mocking smile", "LEFT"), "mocking, cold")),
 ("r2", 6, f"Medium shot of {EDM} {YARD}, {ER}, already in place, he looks down at the car keys and avoids looking up, uncomfortable, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy-blue polo shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, quiet, his eyes shine, he looks at his son", EDM_B, "RIGHT", "quiet, hurt, slow",
     f"Close-up of {WEN} {YARD}, {WL}, quiet, his eyes shine", "RIGHT")),
 ("c05", 6, S("c05", "Edmundo", f"Close-up of {EDM} {YARD0}, {ER}, a forced kind smile, he does not hold his father's gaze", WEN_B, "LEFT", "falsely kind, uneasy",
     f"Close-up of {EDM} {YARD}, {ER}, a forced kind smile", "LEFT")),
 ("c06", 6, talk("c06", "Wenceslao", one(f"Close-up of {WEN} {YARD}, {WL}, a sad tender smile, he rests his hand on the copper pail", "RIGHT"), "tender, sad, warm")),
 ("c07", 6, S("c07", "Lizbeth", f"Close-up of {LIZ} {YARD0}, {LR}, she rolls her eyes and waves a hand", WEN_B, "LEFT", "dismissive, mocking",
     f"Close-up of {LIZ} {YARD}, {LR}, she rolls her eyes", "LEFT")),
 ("c08", 6, S("c08", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, surprised and hurt", LIZ_B, "RIGHT", "surprised, hurt",
     f"Close-up of {WEN} {YARD}, {WL}, surprised and hurt", "RIGHT")),
 ("c09", 6, talk("c09", "Lizbeth", one(f"Close-up of {LIZ} {YARD}, {LR}, a proud smug smile, she draws a big imaginary sign in the air with her hands", "LEFT"), "smug, proud")),
 ("r3", 6, one(f"Close-up of {WEN} {YARD}, {WL}, in silence, his eyes shine, he slowly looks up at the old wooden beam above the door", "RIGHT") + " Slow push-in. No dialogue."),
 ("c10", D8("c10"), S("c10", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, moved, his voice low, his eyes shine", EDM_B, "RIGHT", "moved, low, slow",
     f"Close-up of {WEN} {YARD}, {WL}, moved, his eyes shine", "RIGHT")),
 ("c11", 6, talk("c11", "Edmundo", one(f"Close-up of {EDM} {YARD}, {ER}, uncomfortable, he scratches the back of his neck", "LEFT"), "uncomfortable, dismissive")),
 ("c12", 6, S("c12", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, bitter and quiet", EDM_B, "RIGHT", "bitter, quiet",
     f"Close-up of {WEN} {YARD}, {WL}, bitter and quiet", "RIGHT")),
 ("c13", D8("c13"), S("c13", "Lizbeth", f"Close-up of {LIZ} {YARD0}, {LR}, her long hair loose down her shoulders, cold, arms crossed", WEN_B, "LEFT", "cold, cruel",
     f"Close-up of {LIZ} {YARD}, {LR}, cold, arms crossed", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: two old wrinkled brown hands rest on {PADDLE} inside {PAIL}, pink ice cream on the paddle; only the hands, no face. No dialogue."),
 ("c14", 6, talk("c14", "Wenceslao", one(f"Close-up of {WEN} {YARD}, {WL}, he slowly unties his white apron, calm and decided", "RIGHT"), "calm, decided, firm")),
 ("c15", 6, S("c15", "Edmundo", f"Close-up of {EDM} {YARD0}, {ER}, he laughs nervously", WEN_B, "LEFT", "surprised, condescending",
     f"Close-up of {EDM} {YARD}, {ER}, he laughs nervously", "LEFT")),
 ("c16", 6, S("c16", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, calm, a small knowing smile", EDM_B, "RIGHT", "calm, mysterious",
     f"Close-up of {WEN} {YARD}, {WL}, calm, a small knowing smile", "RIGHT")),
 ("c17", 6, talk("c17", "Lizbeth", one(f"Close-up of {LIZ} {YARD}, {LR}, she laughs out loud and shakes her head", "LEFT"), "mocking, amused")),
 # r4: presentación de la licenciada en la puerta de la calle
 ("r4", 6, f"Medium shot of {MON} {YARD}, {MR}, already standing in place in the doorway, the cobbled street behind her, she adjusts her glasses, serious and elegant, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a navy-blue suit')}. Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Montserrat", f"Close-up of {MON} {YARD0}, {MR}, polite and respectful, she lifts the leather folder", WEN_B, "LEFT", "polite, professional, respectful",
     f"Close-up of {MON} {YARD}, {MR}, polite and respectful", "LEFT")),
 ("c19", 6, talk("c19", "Edmundo", one(f"Close-up of {EDM} {YARD}, {ER}, alarmed, he steps forward", "RIGHT"), "alarmed, defensive")),
 ("c20", 6, talk("c20", "Montserrat", one(f"Close-up of {MON} {YARD}, {MR}, calm and firm, she looks over her glasses", "LEFT"), "calm, firm, professional")),
 ("c21", 6, S("c21", "Lizbeth", f"Close-up of {LIZ} {YARD0}, {LR}, her smile gone, worried", WEN_B, "LEFT", "worried, suspicious",
     f"Close-up of {LIZ} {YARD}, {LR}, her smile gone, worried", "LEFT")),
 ("c22", 6, S("c22", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, calm and firm, a hint of a smile", LIZ_B, "RIGHT", "calm, firm, a little ironic",
     f"Close-up of {WEN} {YARD}, {WL}, calm and firm", "RIGHT")),
 ("c23", D8("c23"), talk("c23", "Montserrat", one(f"Close-up of {MON} {YARD}, {MR}, she opens {FOLDER} and reads from a page with no readable words, professional", "LEFT"), "clear, professional, calm")),
 ("c24", 6, talk("c24", "Edmundo", one(f"Close-up of {EDM} {YARD}, {ER}, nervous, sweat on his forehead, he forces a smile", "LEFT"), "nervous, pleading")),
 ("c25", 6, S("c25", "Wenceslao", f"Close-up of {WEN} {YARD0}, {WL}, calm and sad, his eyes shine", EDM_B, "RIGHT", "calm, sad, final",
     f"Close-up of {WEN} {YARD}, {WL}, calm and sad", "RIGHT")),
 ("c26", 6, talk("c26", "Lizbeth", one(f"Close-up of {LIZ} {YARD}, {LR}, a panicked forced smile, she pulls the old suitcase toward her", "LEFT"), "nervous, falsely sweet")),
 # CTA con carisma (después del BLACK): Wenceslao solo, a cámara
 ("c27", 10, talk("c27", "Wenceslao", f"Close-up from the chest up of {WEN} {YARD}, alone, holding {PADDLE}, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; he starts with a calm half smile, makes a short pause, raises one eyebrow, taps the wooden paddle on his palm, "
     f"smooths his white mustache, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Pues sí, estorba.", "Pues sí, ya está cansado."), ("Los clientes no quieren ver a un viejo cansado detrás del mostrador.", "Los clientes quieren algo nuevo."),
        ("Nomás un viejo que estorba en la cocina.", "Nomás un viejo en la cocina."), ("asilo", "casa de reposo"),
        ("sweat on his forehead", "his forehead shining"), ("panicked", "worried"), ("laughs out loud", "smiles widely"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light inside a small traditional ice cream parlor in Tepoztlán, Morelos, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, small Mexican village ice cream shop with a tiled counter and a copper ice cream pail, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{WENCESLAO_SALGADO}", "a thin Mexican man in his seventies with short white hair, a white mustache, a white guayabera and a long white apron"),
         ("@{LIZBETH_BERMUDEZ}", "a Mexican woman in her forties with long dark-brown hair with honey highlights and a tight turquoise blouse"),
         ("@{EDMUNDO_SALGADO}", "a chubby Mexican man in his forties with slicked-back black hair, a black goatee and a navy-blue polo shirt"),
         ("@{MONTSERRAT_NOTARIA}", "a Mexican woman in her fifties with short grey hair, thin black glasses and a navy-blue skirt suit"),
         (" @{LOC_NEVERIATEPOZ}", "")]
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
