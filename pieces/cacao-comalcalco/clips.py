"""Genera los clips de cacao-comalcalco PARTE 1 (La Heredera de Comalcalco, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #53 "La heredera salvaje" [CAPO] (Patronas y haciendas), cierre tipo 3 (una palabra reveladora): en el comedor de la hacienda cacaotera de Comalcalco, Rosario (38), una mujer
de la sierra que heredó todo por testamento, come con la mano. Los cuñados Arturo (58) y Leonor (56) se burlan y anuncian que mañana un doctor firmará que no está en sus cabales; el
mayordomo Eusebio (72) la defiende. Rosario cuenta que don Julián subía a verla cada mes y, cuando le preguntan quién es, responde: "La hija de Julián… y de Candelaria" (la cocinera).
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
# Geografía fija (comedor): Rosario sentada a la IZQUIERDA en la cabecera; Arturo y Leonor sentados a la DERECHA de la mesa; Eusebio de pie a la IZQUIERDA junto al aparador.
YARD0 = ("in the dining room of an old cacao hacienda in Comalcalco, Tabasco @{LOC_HACIENDACACAO} at midday: high ceilings, a slow ceiling fan, tall wooden doors with open shutters to a green garden "
         "of cacao trees, a long dark-wood dining table with white plates and a clay basket of tortillas, a wooden sideboard, humid tropical light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ROS = ("@{ROSARIO_BENITEZ} (38-year-old Mexican woman, sun-tanned brown skin, thick curly black hair tied back with loose strands, no makeup, a plain white cotton blouse with rolled-up sleeves)")
ART = ("@{ARTURO_GARRIDO} (58-year-old Mexican man, light skin, receding grey hair, gold-rimmed glasses, a cream linen suit over a light-blue shirt)")
MER = ("@{LEONOR_GARRIDO} (56-year-old Mexican woman, fair skin, auburn hair in a short neat bob, a pearl necklace, a lilac silk blouse)")
EUS = ("@{EUSEBIO_MAY} (72-year-old Mexican man, dark-brown skin, short white hair, a thin white beard, a beige long-sleeve shirt buttoned to the top)")
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

ROS_B = "@{ROSARIO_BENITEZ} seen from behind (thick curly black hair tied back, plain white cotton blouse)"
ART_B = "@{ARTURO_GARRIDO} seen from behind (receding grey hair, cream linen suit jacket)"
LEO_B = "@{LEONOR_GARRIDO} seen from behind (auburn hair in a short bob, lilac silk blouse)"
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

RL = "seated at the head of the table on the LEFT"
AR = "seated on the RIGHT side of the table"
MR = "seated on the RIGHT side of the table next to Arturo"
EL = "standing on the LEFT by the wooden sideboard"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Arturo YA hablando con desprecio, Leonor de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Arturo", f"Medium close-up of {ART} {YARD0}, {AR}, talking from the very first frame, contemptuous, he nods toward the head of the table", LEO_B, "LEFT", "contemptuous, low, mocking",
     f"Medium close-up of {ART} {YARD}, {AR}, talking from the very first frame, contemptuous", "LEFT")),
 ("c02", 6, S("c02", "Leonor", f"Close-up of {MER} {YARD0}, {MR}, wrinkling her nose with disgust, she dabs her lips with a napkin", ART_B, "RIGHT", "snobbish, disgusted, low",
     f"Close-up of {MER} {YARD}, {MR}, snobbish", "RIGHT")),
 ("c03", 6, S("c03", "Rosario", f"Close-up of {ROS} {YARD0}, {RL}, calmly folding a tortilla with her fingers, unbothered, looking at them", LEO_B, "RIGHT", "calm, dry, unbothered",
     f"Close-up of {ROS} {YARD}, {RL}, calmly holding a folded tortilla, unbothered", "RIGHT")),
 ("c04", D8("c04"), S("c04", "Arturo", f"Close-up of {ART} {YARD0}, {AR}, he takes off his glasses, cold and condescending", ROS_B, "LEFT", "cold, condescending",
     f"Close-up of {ART} {YARD}, {AR}, cold and condescending", "LEFT")),
 ("c05", 6, talk("c05", "Eusebio", one(f"Close-up of {EUS} {YARD}, {EL}, respectful but firm, his hands clasped in front of him", "RIGHT"), "respectful, firm, old voice")),
 ("c06", 6, S("c06", "Leonor", f"Close-up of {MER} {YARD0}, {MR}, without looking at him, icy", ROS_B, "LEFT", "icy, dismissive",
     f"Close-up of {MER} {YARD}, {MR}, icy", "LEFT")),
 ("c07", D8("c07"), S("c07", "Arturo", f"Close-up of {ART} {YARD0}, {AR}, a satisfied thin smile, he leans back in his chair", ROS_B, "LEFT", "satisfied, cold, slow",
     f"Close-up of {ART} {YARD}, {AR}, a satisfied thin smile", "LEFT")),
 ("r1", 6, one(f"Close-up of {ROS} {YARD}, {RL}, she slowly puts the tortilla down on her plate and wipes her fingers, her eyes fixed on him, completely calm", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), S("c08", "Rosario", f"Close-up of {ROS} {YARD0}, {RL}, quiet and steady, a sad half smile", ART_B, "RIGHT", "quiet, steady, low",
     f"Close-up of {ROS} {YARD}, {RL}, quiet and steady", "RIGHT")),
 ("c09", 6, S("c09", "Leonor", f"Close-up of {MER} {YARD0}, {MR}, a short incredulous laugh", ROS_B, "LEFT", "incredulous, mocking",
     f"Close-up of {MER} {YARD}, {MR}, incredulous", "LEFT")),
 ("c10", 6, S("c10", "Rosario", f"Close-up of {ROS} {YARD0}, {RL}, calm, certain, she holds her gaze", LEO_B, "RIGHT", "calm, certain",
     f"Close-up of {ROS} {YARD}, {RL}, calm and certain", "RIGHT")),
 ("c11", 6, S("c11", "Arturo", f"Close-up of {ART} {YARD0}, {AR}, leaning forward over the table, nervous now, his voice rising", ROS_B, "LEFT", "nervous, rising, demanding",
     f"Close-up of {ART} {YARD}, {AR}, leaning forward, nervous", "LEFT")),
 ("c12", 6, talk("c12", "Rosario", one(f"Close-up of {ROS} {YARD}, {RL}, very calm, she says it low and slowly, her eyes shining, chin up", "RIGHT"), "very low, slow, firm, emotional")),
 ("r2", 6, f"Medium two-shot {YARD0}: {MER} and {ART} {AR}, both frozen; she drops her fork on the plate, he goes pale and stares ahead; {PAIR}. Nobody speaks, all mouths closed. No dialogue."),
 # CTA con carisma (después del BLACK): Rosario a cámara
 ("c13", 10, talk("c13", "Rosario", f"Close-up from the chest up of {ROS} {YARD}, standing by the table, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a loose curl behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small proud smile. Nobody else around.",
     "charismatic, proud, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous", "cool"), ("mocking", "amused"), ("disgusted", "annoyed"), ("icy", "cold"), ("condescending", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, humid midday light in the high-ceilinged dining room of an old cacao hacienda in Tabasco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old hacienda dining room in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSARIO_BENITEZ}", "a sun-tanned Mexican woman in her late thirties with curly black hair tied back and a plain white cotton blouse"),
         ("@{ARTURO_GARRIDO}", "a Mexican man in his late fifties with receding grey hair, gold-rimmed glasses and a cream linen suit"),
         ("@{LEONOR_GARRIDO}", "an elegant Mexican woman in her fifties with an auburn bob, a pearl necklace and a lilac silk blouse"),
         ("@{EUSEBIO_MAY}", "an old Mexican man with dark-brown skin, short white hair, a thin white beard and a beige buttoned shirt"),
         (" @{LOC_HACIENDACACAO}", "")]
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
