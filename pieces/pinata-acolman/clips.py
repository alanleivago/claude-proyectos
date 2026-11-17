"""Genera los clips de pinata-acolman PARTE 1 (La Piñata de Acolman, MAJESTIC STORIES, navideña) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2) con tema de Navidad: en Nochebuena, en un taller de piñatas de Acolman, la nuera Yesenia (42) le hace la maleta a don Pascual (76) para mandarlo
al asilo "antes de que empiece la posada" y su hijo Emilio (45) dice que ya firmó. Llega la licenciada Eugenia (60), notaria, por las piñatas de la posada del barrio: la firma es falsa.
Giro: quien falsificó la firma fue su propio hijo Emilio.
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
# Geografía fija (patio del taller): Pascual a la IZQUIERDA junto a su mesa de piñatas (luego con Eugenia a su lado); Yesenia y Emilio a la DERECHA, junto a la puerta de la casa.
YARD0 = ("in the patio of a family piñata workshop in Acolman, State of Mexico @{LOC_PATIOPINATAS} on Christmas Eve night: colorful seven-pointed star piñatas hanging from strings, "
         "warm string lights and paper lanterns, a long wooden table with paper and glue pots, an adobe house with a wooden door; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CASE = "an old brown suitcase"
PAS = ("@{PASCUAL_ROJAS} (76-year-old Mexican man, small and thin, brown wrinkled skin, white hair, round glasses, a white mustache, a beige knitted cardigan over a plaid shirt)")
EMI = ("@{EMILIO_ROJAS} (45-year-old Mexican man, light-brown skin, short black hair with a receding hairline, clean-shaven, a navy-blue quilted vest over a light-blue shirt)")
YES = ("@{YESENIA_PINEDA} (42-year-old Mexican woman, light skin, straight dyed burgundy hair, heavy makeup, a red Christmas sweater with white snowflakes)")
EUG = ("@{EUGENIA_SALAS} (60-year-old elegant Mexican woman, light-brown skin, short grey hair, gold-rimmed glasses, a camel wool coat over a black turtleneck, a red scarf)")
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

# Bordes: Yesenia o Emilio le hablan a Pascual/Eugenia -> espalda LEFT; Pascual o Eugenia les hablan -> espalda RIGHT.
PAS_B = "@{PASCUAL_ROJAS} seen from behind (white hair, beige knitted cardigan, small and thin)"
EMI_B = "@{EMILIO_ROJAS} seen from behind (short black hair, navy-blue quilted vest)"
YES_B = "@{YESENIA_PINEDA} seen from behind (straight burgundy hair, red Christmas sweater)"
EUG_B = "@{EUGENIA_SALAS} seen from behind (short grey hair, camel wool coat, red scarf)"
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

PL = f"standing on the LEFT beside the wooden table of piñatas, {CASE} at his feet"    # Pascual
GL = "standing on the LEFT in the patio"                                                # Eugenia
YR = "standing on the RIGHT by the wooden door of the house, holding a folder of papers"   # Yesenia
ER = "standing on the RIGHT by the wooden door of the house"                            # Emilio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Yesenia YA hablando junto a la puerta, con la maleta del suegro a sus pies; Pascual de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Yesenia", f"Medium close-up of {YES} {YARD0}, {YR}, talking from the very first frame, cold and bossy, the old suitcase next to the old man", PAS_B, "LEFT", "cold, bossy, smug",
     f"Medium close-up of {YES} {YARD}, {YR}, talking from the very first frame, cold and bossy", "LEFT")),
 ("c02", D8("c02"), S("c02", "Pascual", f"Close-up of {PAS} {YARD0}, {PL}, hurt but dignified, glue on his fingers", YES_B, "RIGHT", "hurt, dignified, slow",
     f"Close-up of {PAS} {YARD}, {PL}, hurt but dignified", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Yesenia", one(f"Close-up of {YES} {YARD}, {YR}, a cold smile, she rolls her eyes", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {EMI} {YARD}, {ER}, already in place, he comes out of the wooden door and stops, uncomfortable, avoiding his father's eyes, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy vest')}. Slow push-in. No dialogue."),
 ("c04", D8("c04"), S("c04", "Pascual", f"Close-up of {PAS} {YARD0}, {PL}, his eyes shine behind his glasses, he looks at his son", EMI_B, "RIGHT", "hurt, soft, sad",
     f"Close-up of {PAS} {YARD}, {PL}, his eyes shine", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Emilio", f"Close-up of {EMI} {YARD0}, {ER}, uncomfortable, he looks down", PAS_B, "LEFT", "uncomfortable, quick",
     f"Close-up of {EMI} {YARD}, {ER}, uncomfortable", "LEFT")),
 ("c06", 6, talk("c06", "Pascual", one(f"Close-up of {PAS} {YARD}, {PL}, firm and calm, he raises his steady hand", "RIGHT"), "firm, calm, slow")),
 ("i01", 6, f"Close-up insert {YARD0}: a colorful seven-pointed star piñata hanging under the warm string lights, slowly turning, a small nativity scene below; only the piñata and the lights, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {EUG} {YARD}, {GL}, already standing in place near the gate of the patio, she looks at the piñatas with a warm smile, elegant, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a camel coat')}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Eugenia", one(f"Close-up of {EUG} {YARD}, {GL}, warm and polite, she adjusts her red scarf", "RIGHT"), "warm, polite")),
 ("c08", D8("c08"), (talk("c08", "Pascual", two(f"{PAS} on the LEFT and {EUG} on the RIGHT, facing each other under the hanging piñatas {YARD0}, framed from the waist up; "
     f"Pascual, glad but sad, slightly closer to the camera and in sharper focus") + " " + MOUTH("Pascual", "Eugenia"), "glad, soft"),
   talk("c08", "Pascual", one(f"Close-up of {PAS} {YARD}, {PL}, glad but sad", "RIGHT"), "glad, soft"))),
 ("c09", 6, talk("c09", "Eugenia", one(f"Close-up of {EUG} {YARD}, {GL}, surprised, she looks down at the suitcase", "RIGHT"), "surprised, concerned")),
 ("c10", 6, talk("c10", "Pascual", one(f"Close-up of {PAS} {YARD}, {PL}, tired and humble, a sad small smile", "RIGHT"), "tired, humble")),
 ("c11", D8("c11"), S("c11", "Eugenia", f"Close-up of {EUG} {YARD0}, {GL}, firm and professional, she holds out her hand for the papers", YES_B, "RIGHT", "firm, professional",
     f"Close-up of {EUG} {YARD}, {GL}, firm and professional", "RIGHT")),
 ("c12", 6, S("c12", "Yesenia", f"Close-up of {YES} {YARD0}, {YR}, nervous, she holds the folder against her chest", EUG_B, "LEFT", "nervous, defensive",
     f"Close-up of {YES} {YARD}, {YR}, nervous", "LEFT")),
 ("c13", D8("c13"), talk("c13", "Eugenia", one(f"Close-up of {EUG} {YARD}, {GL}, holding a paper and looking at it through her glasses, then looking up, cold and sure", "RIGHT"), "cold, sure, slow")),
 ("r3", 6, one(f"Close-up of {YES} {YARD}, {YR}, in silence, pale, she presses her lips together and glances at her husband", "LEFT") + " Slow push-in. No dialogue."),
 ("c14", 6, S("c14", "Pascual", f"Close-up of {PAS} {YARD0}, {PL}, serious and firm, his eyes hard behind his glasses", YES_B, "RIGHT", "serious, firm",
     f"Close-up of {PAS} {YARD}, {PL}, serious and firm", "RIGHT")),
 ("c15", D8("c15"), talk("c15", "Yesenia", one(f"Close-up of {YES} {YARD}, {YR}, a sudden spiteful smile, she points with her chin at her husband", "LEFT"), "spiteful, sly")),
 ("r4", 6, one(f"Close-up of {PAS} {YARD}, {PL}, in silence, stunned, he slowly takes off his glasses, his eyes fill with tears", "RIGHT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Emilio", one(f"Close-up of {EMI} {YARD}, {ER}, ashamed, his voice breaking", "LEFT"), "ashamed, pleading")),
 # CTA con carisma (después del BLACK): Pascual solo, a cámara
 ("c17", 10, talk("c17", "Pascual", f"Close-up from the chest up of {PAS} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts his round glasses back on, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Ustedes qué harían con un hijo que falsifica su firma?", "¿Ustedes qué harían con un hijo así?"), ("Esta firma no es de don Pascual.", "Esta no es la firma de don Pascual."),
        ("spiteful", "small"), ("stunned", "surprised"), ("his eyes fill with tears", "his eyes shine"), ("his voice breaking", "softly"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm string lights in the patio of a piñata workshop on Christmas Eve in Acolman, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican Christmas posada patio with colorful star piñatas and lanterns, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{PASCUAL_ROJAS}", "a small thin elderly Mexican man with white hair, round glasses, a white mustache and a beige knitted cardigan"),
         ("@{EMILIO_ROJAS}", "a Mexican man in his forties with a receding hairline and a navy-blue quilted vest"),
         ("@{YESENIA_PINEDA}", "a Mexican woman in her forties with burgundy hair, heavy makeup and a red Christmas sweater"),
         ("@{EUGENIA_SALAS}", "an elegant Mexican woman around sixty with short grey hair, gold glasses, a camel coat and a red scarf"),
         (" @{LOC_PATIOPINATAS}", "")]
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
