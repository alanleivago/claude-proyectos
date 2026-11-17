"""Genera los clips de palofierro-kino PARTE 1 (El Palo Fierro de Kino, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado ("le dio cinco minutos y no le creyó"): en la playa de Bahía de Kino, Sonora, Brayan (32) le tira las figuras de palo fierro a don Eliseo (70) y le da plazo
"antes de que se meta el sol" para poner su restaurante. Eliseo, tranquilo, le da cinco minutos para levantarlas. Brayan llama a su papá Saúl (58), que llega y le pide perdón al viejo:
Eliseo era "el patrón" de toda la costa antes de retirarse. Giro: el que lo traicionó aquella noche sigue vivo. Su nieta Nayeli (24) no sabía nada.
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
# Geografía fija (puesto en la playa): Eliseo (sentado en su mesa de tallado) y Nayeli a la IZQUIERDA; Brayan y Saúl a la DERECHA, del lado del camino de arena.
YARD0 = ("on the beach at Bahía de Kino, Sonora @{LOC_PLAYAKINO} at golden sunset: a small open palm-roof stand on the sand with a wooden table full of polished dark ironwood carvings "
         "of dolphins, turtles and eagles, rocky hills with saguaro cacti, the calm turquoise sea behind, warm golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CARVING = "a small polished dark ironwood carving of a dolphin"
PHONE = "a smartphone"
ELI = ("@{ELISEO_ROBLES} (70-year-old Mexican man, lean, deeply tanned skin, white hair tied in a short ponytail, a short white beard, a faded light-blue linen shirt)")
NAY = ("@{NAYELI_ROBLES} (24-year-old Mexican woman, tanned skin, long loose black hair, an open white linen shirt over a coral top)")
BRA = ("@{BRAYAN_SOTO} (32-year-old Mexican man, light-brown skin, curly black hair with a fade, a thin mustache, a printed silk shirt with green palm leaves, a gold chain, sunglasses on his head)")
SAU = ("@{SAUL_SOTO} (58-year-old Mexican man, heavy-set, light-brown skin, grey crew cut, a thick grey mustache, a cream straw cowboy hat, a black polo shirt)")
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

# Bordes: Brayan o Saúl le hablan a Eliseo/Nayeli -> espalda LEFT; Eliseo o Nayeli les hablan -> espalda RIGHT.
ELI_B = "@{ELISEO_ROBLES} seen from behind (white hair in a short ponytail, faded light-blue linen shirt)"
NAY_B = "@{NAYELI_ROBLES} seen from behind (long loose black hair, open white linen shirt)"
BRA_B = "@{BRAYAN_SOTO} seen from behind (curly black hair with a fade, printed silk shirt with green palm leaves)"
SAU_B = "@{SAUL_SOTO} seen from behind (cream straw cowboy hat, black polo shirt, heavy-set)"
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

EL = f"sitting on the LEFT at his wooden carving table under the palm roof, sanding {CARVING}"   # Eliseo
ES = "standing on the LEFT beside his wooden carving table"                                      # Eliseo de pie
NL = "standing on the LEFT beside the palm-roof stand"                                           # Nayeli
BR = "standing on the RIGHT on the sand, a black SUV parked behind him"                          # Brayan
SR = "standing on the RIGHT on the sand"                                                         # Saúl

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Brayan YA hablando junto a su camioneta; Eliseo de espaldas (LEFT) en su mesa. Plazo: antes de que se meta el sol.
 ("c01", D8("c01"), S("c01", "Brayan", f"Medium close-up of {BRA} {YARD0}, {BR}, talking from the very first frame, arrogant, he waves a hand at the carvings with disdain", ELI_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {BRA} {YARD}, {BR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Eliseo", f"Close-up of {ELI} {YARD0}, {EL}, completely calm, he keeps sanding without looking up", BRA_B, "RIGHT", "calm, slow, firm",
     f"Close-up of {ELI} {YARD}, {EL}, completely calm", "RIGHT")),
 ("c03", 6, talk("c03", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, a cocky smile, he taps his phone in his pocket", "LEFT"), "cocky, mocking")),
 ("r1", 6, f"Medium shot of {NAY} {YARD}, {NL}, already in place arranging carvings, she stops and looks at the visitor, worried and annoyed, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman with long black hair')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Nayeli", f"Close-up of {NAY} {YARD0}, {NL}, firm and protective", BRA_B, "RIGHT", "firm, protective",
     f"Close-up of {NAY} {YARD}, {NL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Brayan", f"Close-up of {BRA} {YARD0}, {BR}, dismissive, he does not even look at her", NAY_B, "LEFT", "dismissive, cold",
     f"Close-up of {BRA} {YARD}, {BR}, dismissive", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold chain bracelet slowly sweeps several polished ironwood carvings off the wooden table and they fall onto the sand; only the hand, the table and the carvings, no face. No dialogue."),
 ("c06", D8("c06"), S("c06", "Eliseo", f"Close-up of {ELI} {YARD0}, {EL}, he slowly puts down the carving and looks up, calm and cold, his eyes very steady", BRA_B, "RIGHT", "calm, cold, slow",
     f"Close-up of {ELI} {YARD}, {EL}, calm and cold, his eyes very steady", "RIGHT")),
 ("c07", 6, talk("c07", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, he laughs out loud, amused", "LEFT"), "amused, mocking")),
 ("c08", 6, talk("c08", "Eliseo", one(f"Close-up of {ELI} {YARD}, {EL}, a small calm smile, completely sure", "RIGHT"), "calm, sure, low")),
 ("r2", 6, f"Medium shot of {ELI} {YARD}, {EL}, in silence, he calmly picks up another piece of wood and keeps sanding, then glances at an old wristwatch, unbothered, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, holding {PHONE} to his ear, laughing and mocking", "LEFT"), "mocking, amused")),
 ("c10", 6, talk("c10", "Saúl", f"Close-up of {SAU} sitting in the back seat of a dark SUV, holding {PHONE} to his ear, his face goes pale and serious, the only person in the shot; {ONE}.", "shocked, serious, firm")),
 ("i02", 6, "Wide shot of two black SUVs driving fast along a sandy coastal road between saguaro cacti and the turquoise sea at Bahía de Kino, Sonora, at golden sunset, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {SAU} {YARD}, {SR}, already standing in place, he quickly takes off his cream straw hat and holds it against his chest, humble and nervous, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black polo shirt')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Saúl", f"Close-up of {SAU} {YARD0}, {SR}, holding his hat against his chest, humble and respectful, he lowers his head", ELI_B, "LEFT", "humble, respectful, nervous",
     f"Close-up of {SAU} {YARD}, {SR}, holding his hat, humble and respectful", "LEFT")),
 ("c12", 6, talk("c12", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, confused and offended, he looks at his father", "RIGHT"), "confused, offended")),
 ("c13", 6, talk("c13", "Saúl", one(f"Close-up of {SAU} {YARD}, {SR}, cold and furious with his son, very serious", "RIGHT"), "cold, serious, firm")),
 ("r4", 6, f"Medium shot of {BRA} {YARD}, kneeling on the sand in his white trousers, he picks up the ironwood carvings one by one and puts them back on the table, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a palm leaf shirt')}. No dialogue."),
 ("c14", 6, S("c14", "Eliseo", f"Close-up of {ELI} {YARD0}, {ES}, calm and serious, a little tired", SAU_B, "RIGHT", "calm, serious, tired",
     f"Close-up of {ELI} {YARD}, {ES}, calm and serious", "RIGHT")),
 ("c15", 6, S("c15", "Saúl", f"Close-up of {SAU} {YARD0}, {SR}, respectful, he nods slowly", ELI_B, "LEFT", "respectful, low",
     f"Close-up of {SAU} {YARD}, {SR}, respectful, he nods", "LEFT")),
 ("c16", 6, talk("c16", "Nayeli", one(f"Close-up of {NAY} {YARD}, {NL}, stunned, she turns to her grandfather", "RIGHT"), "stunned, confused")),
 ("c17", D8("c17"), (talk("c17", "Eliseo", two(f"{NAY} on the LEFT and {ELI} on the RIGHT, close together beside the carving table {YARD0}, framed from the waist up; "
     f"Eliseo speaks low and calm to his granddaughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eliseo", "Nayeli"), "low, calm, honest"),
   talk("c17", "Eliseo", one(f"Close-up of {ELI} {YARD}, {ES}, low, calm and honest", "LEFT"), "low, calm, honest"))),
 ("c18", 6, talk("c18", "Saúl", one(f"Close-up of {SAU} {YARD}, {SR}, he steps closer and lowers his voice, worried", "LEFT"), "low, worried, serious")),
 # CTA con carisma (después del BLACK): Eliseo solo, a cámara
 ("c19", 10, talk("c19", "Eliseo", f"Close-up from the chest up of {ELI} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, strokes his white beard, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small dangerous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Con una llamada, usted se va de Kino.", "Con una llamada, todo cambia."), ("Antes de tallar madera, yo mandaba en toda esta costa.", "Antes de tallar madera, yo era el patrón de toda esta costa."),
        ("El que lo traicionó aquella noche sigue vivo.", "El que le falló aquella noche sigue por aquí."),
        ("sweeps", "moves"), ("fall onto the sand", "rest on the sand"), ("cold and furious with his son", "serious"), ("humiliated", "quiet"), ("stunned", "surprised"),
        ("shocked", "surprised"), ("dangerous", "mysterious"), ("his face goes pale", "he becomes serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden sunset light on a beach stand with ironwood carvings at Bahía de Kino, Sonora, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, beach palm-roof stand with saguaro hills and the turquoise sea in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ELISEO_ROBLES}", "a lean deeply tanned elderly Mexican man with a white ponytail, a short white beard and a light-blue linen shirt"),
         ("@{NAYELI_ROBLES}", "a tanned Mexican woman in her twenties with long loose black hair and an open white linen shirt over a coral top"),
         ("@{BRAYAN_SOTO}", "a Mexican man in his thirties with curly black hair, a thin mustache, a palm-leaf silk shirt and a gold chain"),
         ("@{SAUL_SOTO}", "a heavy-set Mexican man in his late fifties with a grey mustache, a cream straw cowboy hat and a black polo shirt"),
         (" @{LOC_PLAYAKINO}", "")]
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
