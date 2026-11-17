"""Genera los clips de queso-tequisquiapan PARTE 1 (El Queso de Tequisquiapan, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que la villana no cree -> llega el patrón -> giro familiar): en Tequisquiapan, Querétaro, Vanesa (38), esposa del ranchero
Fulgencio, le corta la leche a doña Petra (72), le tira los quesos y le da plazo "antes de que suenen las campanas". Petra le manda saludos a su marido; Fulgencio llega en persona.
Giro: Petra es su esposa (nunca se divorciaron) y Nicanor (45), el hijo callado de Petra, es su primer hijo.
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
# Geografía fija (quesería bajo el portal): Petra y Nicanor a la IZQUIERDA (mostrador y tina); Vanesa y Fulgencio a la DERECHA (del lado de la plaza).
YARD0 = ("in a small artisan cheese shop under a stone arcade in Tequisquiapan, Querétaro @{LOC_QUESERIA} in the morning: a wooden counter with rounds of fresh white cheese, metal milk cans, "
         "a big steel vat with curd, cheesecloths hanging, a cobblestone square with pink bougainvillea behind, soft morning light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHONE = "a smartphone"
PET = ("@{PETRA_OLVERA} (72-year-old Mexican woman, small, brown skin, white hair in a long braid, small gold earrings, a light-blue checkered apron over a dark-green dress)")
NIC = ("@{NICANOR_OLVERA} (45-year-old Mexican man, stocky, brown skin, short black hair, a round gentle face, a plain white t-shirt, a white rubber work apron)")
VAN = ("@{VANESA_UGALDE} (38-year-old glamorous Mexican woman, light skin, long straight black hair, red lipstick, big sunglasses on her head, a fuchsia silk blouse, white jeans)")
FUL = ("@{FULGENCIO_ARVIZU} (72-year-old Mexican man, tall, light-brown skin, white hair, a short white beard, a grey felt cowboy hat, a tan suede jacket over a white shirt)")
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

# Bordes: Vanesa o Fulgencio le hablan a Petra/Nicanor -> espalda LEFT; Petra o Nicanor les hablan -> espalda RIGHT.
PET_B = "@{PETRA_OLVERA} seen from behind (white hair in a long braid, the strings of a light-blue checkered apron over a dark-green dress, small)"
NIC_B = "@{NICANOR_OLVERA} seen from behind (short black hair, white t-shirt, stocky)"
VAN_B = "@{VANESA_UGALDE} seen from behind (long straight black hair, fuchsia silk blouse)"
FUL_B = "@{FULGENCIO_ARVIZU} seen from behind (grey felt cowboy hat, tan suede jacket, tall)"
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

PL = "standing on the LEFT behind the wooden counter of fresh cheeses"          # Petra
NL = "standing on the LEFT beside the steel vat of curd"                         # Nicanor
VR = "standing on the RIGHT in front of the counter, on the side of the square"  # Vanesa
FR = "standing on the RIGHT under the stone arcade, the square behind him"       # Fulgencio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Vanesa YA hablando frente al mostrador; Petra de espaldas (LEFT). Plazo: antes de que suenen las campanas.
 ("c01", D8("c01"), S("c01", "Vanesa", f"Medium close-up of {VAN} {YARD0}, {VR}, talking from the very first frame, arrogant, she taps a metal milk can with her long nails", PET_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {VAN} {YARD}, {VR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm and proud, she wipes her hands on her apron", VAN_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {PET} {YARD}, {PL}, calm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, a cold smile, she lowers her sunglasses", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {NIC} {YARD}, {NL}, already in place stirring the curd with a long wooden paddle, he stops and looks up, serious and shy, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white apron')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Nicanor", f"Close-up of {NIC} {YARD0}, {NL}, shy but firm", VAN_B, "RIGHT", "shy, firm, soft",
     f"Close-up of {NIC} {YARD}, {NL}, shy but firm", "RIGHT")),
 ("c05", 6, S("c05", "Vanesa", f"Close-up of {VAN} {YARD0}, {VR}, she laughs once with contempt", NIC_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {VAN} {YARD}, {VR}, she laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with red nails slowly tips a wooden tray of fresh round white cheeses off the edge of the counter and they fall onto the stone floor; only the hand, the tray and the cheeses, no face. No dialogue."),
 ("c06", 6, S("c06", "Petra", f"Close-up of {PET} {YARD0}, {PL}, her eyes shine, indignant but dignified", VAN_B, "RIGHT", "hurt, firm",
     f"Close-up of {PET} {YARD}, {PL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, she shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, one(f"Close-up of {PET} {YARD}, {PL}, in silence, she looks down at the cheeses on the floor, then slowly raises her eyes with a small calm knowing smile", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), S("c08", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm, a small knowing smile", VAN_B, "RIGHT", "calm, knowing, slow",
     f"Close-up of {PET} {YARD}, {PL}, calm, a small knowing smile", "RIGHT")),
 ("c09", 6, talk("c09", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, holding {PHONE} to her ear, laughing and mocking", "LEFT"), "mocking, amused")),
 ("c10", 6, talk("c10", "Fulgencio", f"Close-up of {FUL} sitting in the back seat of a dark SUV, holding {PHONE} to his ear, his face changes from bored to shocked and serious, "
     f"the only person in the shot; {ONE}.", "shocked, serious, firm")),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly on a cobblestone street with colorful colonial houses and a stone arcade in Tequisquiapan, Querétaro, soft morning light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {FUL} {YARD}, {FR}, already standing in place, he slowly takes off his grey felt hat, moved and serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a tan suede jacket')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, holding his hat against his chest, moved, his eyes shine", PET_B, "LEFT", "moved, low, slow",
     f"Close-up of {FUL} {YARD}, {FR}, holding his hat, moved", "LEFT")),
 ("c12", 6, S("c12", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm and firm, without emotion", FUL_B, "RIGHT", "calm, firm, dry",
     f"Close-up of {PET} {YARD}, {PL}, calm and firm", "RIGHT")),
 ("c13", 6, talk("c13", "Fulgencio", one(f"Close-up of {FUL} {YARD}, {FR}, cold and serious, he looks at his young wife", "RIGHT"), "cold, serious, firm")),
 ("c14", 6, talk("c14", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, she laughs in disbelief, arrogant", "LEFT"), "arrogant, disbelieving")),
 ("c15", 6, talk("c15", "Fulgencio", one(f"Close-up of {FUL} {YARD}, {FR}, very calm and cold, his voice low", "RIGHT"), "calm, cold, low")),
 ("r4", 6, one(f"Close-up of {VAN} {YARD}, {VR}, in silence, her smile freezes and disappears, stunned, her mouth half open", "LEFT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, stunned, a nervous laugh", "LEFT"), "stunned, nervous")),
 ("c17", D8("c17"), S("c17", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm and sure, a hint of a smile", VAN_B, "RIGHT", "calm, sure, slow",
     f"Close-up of {PET} {YARD}, {PL}, calm and sure", "RIGHT")),
 ("c18", 6, (talk("c18", "Fulgencio", two(f"{NIC} on the LEFT beside the steel vat and {FUL} on the RIGHT, in profile facing each other under the stone arcade {YARD0}, framed from the waist up; "
     f"Fulgencio looks at him with shining eyes, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fulgencio", "Nicanor"), "moved, low, proud"),
   talk("c18", "Fulgencio", one(f"Close-up of {FUL} {YARD}, {FR}, moved, his eyes shine", "LEFT"), "moved, low, proud"))),
 ("c19", 6, S("c19", "Nicanor", f"Close-up of {NIC} {YARD0}, {NL}, stunned, he turns to his mother", PET_B, "LEFT", "stunned, small, soft",
     f"Close-up of {NIC} {YARD}, {NL}, stunned", "LEFT")),
 # CTA con carisma (después del BLACK): Petra sola, a cámara
 ("c20", 10, talk("c20", "Petra", f"Close-up from the chest up of {PET} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves her braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small wise half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Ya está acostumbrada a agacharse.", "Usted sabe hacerlo."), ("Sin leche, usted no es nadie.", "Sin leche, usted no tiene nada."),
        ("Su boda no vale nada.", "Su boda no cuenta."), ("Ni loca, Fulgencio.", "Eso nunca, Fulgencio."), ("Treinta años de abandono", "treinta años de ausencia"),
        ("tips", "moves"), ("fall onto the stone floor", "rest on the floor"), ("with contempt", "coldly"), ("contemptuous", "cool"),
        ("stunned", "surprised"), ("shocked", "surprised"), ("her mouth half open", "quiet"),
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
          "Vertical scene from a Mexican TV drama, realistic, soft morning light in a small cheese shop under a stone arcade in Tequisquiapan, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic artisan cheese shop with fresh white cheeses in central Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{PETRA_OLVERA}", "a small elderly Mexican woman with a long white braid and a light-blue checkered apron over a green dress"),
         ("@{NICANOR_OLVERA}", "a stocky Mexican man in his forties with a round gentle face, a white t-shirt and a white rubber apron"),
         ("@{VANESA_UGALDE}", "a glamorous Mexican woman in her late thirties with long straight black hair, red lipstick and a fuchsia blouse"),
         ("@{FULGENCIO_ARVIZU}", "a tall elderly Mexican man with a short white beard, a grey felt cowboy hat and a tan suede jacket"),
         (" @{LOC_QUESERIA}", "")]
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
