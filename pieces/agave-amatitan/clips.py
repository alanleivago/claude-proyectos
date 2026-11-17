"""Genera los clips de agave-amatitan PARTE 1 (El Agave de Amatitán, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega el dueño poderoso -> plazo invertido -> el salvador es el enemigo): en los campos de agave de Amatitán, Jalisco, la licenciada Mariela (36),
gerente de la tequilera, despide al viejo jimador don Tobías (66), pisa el sombrero de su padre y le da plazo "antes de que se acabe la temporada"; su hija Lupe (30) lo defiende.
Llega el dueño, don Leandro (72): plazo invertido. Giro: Tobías rechaza su ayuda; el padre de Leandro se quedó con esas tierras con un papel falso, y Tobías tiene el verdadero.
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
# Geografía fija (campo de agave junto al camino): Tobías y Lupe a la IZQUIERDA (entre los surcos); Mariela y Leandro a la DERECHA (del lado del camino de tierra).
YARD0 = ("in a blue agave field in Amatitán, Jalisco @{LOC_AGAVEAMATITAN} in the late afternoon: rows of spiky blue agave plants on red earth, a pile of harvested agave hearts beside a dirt road, "
         "green hills behind, warm golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HAT = "an old worn straw hat"
TOB = ("@{TOBIAS_CORONA} (66-year-old Mexican man, lean and strong, dark-brown weathered skin, short grey hair, a thick white mustache, a white long-sleeve cotton work shirt)")
LUP = ("@{LUPE_CORONA} (30-year-old Mexican woman, brown skin, a long black braid, a light-pink long-sleeve work shirt with rolled sleeves)")
MAR = ("@{MARIELA_ZEPEDA} (36-year-old Mexican businesswoman, light skin, black hair in a sleek high ponytail, red lipstick, a white blazer over a black top, sunglasses on her head)")
LEA = ("@{LEANDRO_ESCALANTE} (72-year-old elegant Mexican man, light skin, silver hair, a neat silver goatee, a cream panama hat, a navy-blue linen suit with a white shirt)")
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

# Bordes: Mariela o Leandro le hablan a Tobías/Lupe -> espalda LEFT; Tobías o Lupe les hablan -> espalda RIGHT.
TOB_B = "@{TOBIAS_CORONA} seen from behind (short grey hair, white long-sleeve cotton work shirt, lean)"
LUP_B = "@{LUPE_CORONA} seen from behind (a long black braid, light-pink work shirt)"
MAR_B = "@{MARIELA_ZEPEDA} seen from behind (black sleek high ponytail, white blazer)"
LEA_B = "@{LEANDRO_ESCALANTE} seen from behind (cream panama hat, navy-blue linen suit jacket)"
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

TL = "standing on the LEFT between rows of blue agave"                 # Tobías
UL = "standing on the LEFT beside a pile of harvested agave hearts"     # Lupe
MR = "standing on the RIGHT at the edge of the dirt road, holding a clipboard"   # Mariela
ER = "standing on the RIGHT on the dirt road"                          # Leandro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Mariela YA hablando con su tabla en la mano; Tobías de espaldas (LEFT). Plazo: antes de que se acabe la temporada.
 ("c01", D8("c01"), S("c01", "Mariela", f"Medium close-up of {MAR} {YARD0}, {MR}, talking from the very first frame, cold and bossy, she taps the clipboard with a pen", TOB_B, "LEFT", "cold, bossy, arrogant",
     f"Medium close-up of {MAR} {YARD}, {MR}, talking from the very first frame, cold and bossy", "LEFT")),
 ("c02", D8("c02"), S("c02", "Tobías", f"Close-up of {TOB} {YARD0}, {TL}, holding {HAT} in his hands, calm and proud", MAR_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {TOB} {YARD}, {TL}, holding {HAT}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, a cold smile, she shrugs", "LEFT"), "cold, mocking")),
 ("r1", 6, f"Medium shot of {LUP} {YARD}, {UL}, already in place, she drops an agave heart on the pile, wipes her hands and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a black braid')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Lupe", f"Close-up of {LUP} {YARD0}, {UL}, firm and protective", MAR_B, "RIGHT", "firm, protective",
     f"Close-up of {LUP} {YARD}, {UL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Mariela", f"Close-up of {MAR} {YARD0}, {MR}, offended, she raises an eyebrow", LUP_B, "LEFT", "offended, cold",
     f"Close-up of {MAR} {YARD}, {MR}, offended", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {HAT} lies on the red dusty earth and a white sneaker slowly steps on its brim; only the shoe and the hat, no face. No dialogue."),
 ("c06", 6, S("c06", "Tobías", f"Close-up of {TOB} {YARD0}, {TL}, his eyes shine, hurt but dignified, he looks down at the hat", MAR_B, "RIGHT", "hurt, dignified",
     f"Close-up of {TOB} {YARD}, {TL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, mocking, she puts her sunglasses on", "LEFT"), "mocking, cruel")),
 ("i02", 6, "Wide shot of two dark SUVs driving slowly along a dusty dirt road between endless rows of blue agave in Amatitán, Jalisco, golden afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {LEA} {YARD}, {ER}, already standing in place, a dark SUV behind him, he slowly takes off dark sunglasses, elegant and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a panama hat')}. Slow push-in. No dialogue."),
 ("c08", D8("c08"), talk("c08", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, serious, he frowns at the hat on the ground", "RIGHT"), "serious, cold, slow")),
 ("c09", 6, talk("c09", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, she quickly takes off her sunglasses, a nervous polite smile", "RIGHT"), "nervous, polite")),
 ("c10", D8("c10"), talk("c10", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, indignant and cold, he points at the old man", "RIGHT"), "indignant, cold")),
 ("c11", 6, talk("c11", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, pale and nervous", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, cold and final", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {MAR} {YARD}, she bends down in her white blazer, picks up {HAT} from the dust and brushes it off, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman in a white blazer')}. No dialogue."),
 ("c13", 6, S("c13", "Lupe", f"Close-up of {LUP} {YARD0}, {UL}, grateful, a small relieved smile", LEA_B, "RIGHT", "grateful, warm",
     f"Close-up of {LUP} {YARD}, {UL}, grateful", "RIGHT")),
 ("c14", 6, S("c14", "Leandro", f"Close-up of {LEA} {YARD0}, {ER}, warm and generous, a friendly smile", TOB_B, "LEFT", "warm, generous",
     f"Close-up of {LEA} {YARD}, {ER}, warm, a friendly smile", "LEFT")),
 ("c15", 6, S("c15", "Tobías", f"Close-up of {TOB} {YARD0}, {TL}, holding his straw hat again, cold and serious, his eyes hard", LEA_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {TOB} {YARD}, {TL}, cold and serious", "RIGHT")),
 ("c16", 6, talk("c16", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, confused, his smile fades", "LEFT"), "confused, defensive")),
 ("c17", D8("c17"), (talk("c17", "Tobías", two(f"{TOB} on the LEFT and {LEA} on the RIGHT, in profile facing each other between the agave rows {YARD0}, framed from the waist up; "
     f"Tobías steps closer and speaks low and firm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Tobías", "Leandro"), "low, firm, slow"),
   talk("c17", "Tobías", one(f"Close-up of {TOB} {YARD}, {TL}, low and firm", "RIGHT"), "low, firm, slow"))),
 ("r4", 6, one(f"Close-up of {LEA} {YARD}, {ER}, in silence, stunned, his face pale, he slowly lowers his sunglasses", "LEFT") + " Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Lupe", f"Close-up of {LUP} {YARD0}, {UL}, surprised, she turns to her father", TOB_B, "LEFT", "surprised, soft",
     f"Close-up of {LUP} {YARD}, {UL}, surprised", "LEFT")),
 # CTA con carisma (después del BLACK): Tobías solo, a cámara
 ("c19", 10, talk("c19", "Tobías", f"Close-up from the chest up of {TOB} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts his old straw hat on, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small proud half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Por eso mismo, ya está viejo.", "Por eso mismo, ya está cansado."), ("Tu padre se quedó con estas tierras con un papel falso.", "Tu padre se quedó con estas tierras con un papel que no era."),
        ("slowly steps on its brim", "rests beside it"), ("humiliated", "quiet"), ("stunned", "surprised"), ("his face pale", "quiet"), ("indignant and cold", "serious"),
        ("powerful", "serious"), ("offended", "surprised"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light in a blue agave field in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rows of blue agave on red earth in western Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TOBIAS_CORONA}", "a lean elderly Mexican man with dark weathered skin, a thick white mustache and a white long-sleeve work shirt"),
         ("@{LUPE_CORONA}", "a Mexican woman around thirty with a long black braid and a light-pink work shirt"),
         ("@{MARIELA_ZEPEDA}", "a Mexican businesswoman in her thirties with a sleek black ponytail, red lipstick and a white blazer"),
         ("@{LEANDRO_ESCALANTE}", "an elegant elderly Mexican man with a silver goatee, a cream panama hat and a navy-blue linen suit"),
         (" @{LOC_AGAVEAMATITAN}", "")]
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
