"""Genera los clips de domino-jerez PARTE 1 (El Dominó de Jerez, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #31 "La partida de dominó" [CAPO], cierre tipo 3 (una palabra reveladora): en una cantina de Jerez, Zacatecas, el forastero Julián (35) le gana tres partidas seguidas a don Severo (68),
el hombre que manda en la región; el cantinero Toño (58) le pide que pare. Severo pide la cuarta y pone una foto boca abajo: si gana Julián, le dice quién es. Julián voltea la foto: es su madre, Rosario.
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
# Geografía fija (cantina): Severo sentado a la DERECHA de la mesa de dominó; Julián sentado a la IZQUIERDA; Toño de pie a la IZQUIERDA, detrás de Julián, junto a la barra.
YARD0 = ("inside an old traditional cantina in Jerez, Zacatecas @{LOC_CANTINAJEREZ} in the late afternoon: a long dark wooden bar with shelves of unlabeled bottles, a square wooden table with domino tiles, "
         "ceiling fans, an old tiled floor, warm light through swinging doors; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHOTO = "an old faded black-and-white photograph of a smiling woman in her twenties with long braids"
SEV = ("@{SEVERO_LECHUGA} (68-year-old Mexican man, heavy-set, weathered light-brown skin, grey hair, a thick grey mustache, a black felt cowboy hat, a dark-brown leather jacket over a black western shirt, silver rings)")
JUL = ("@{JULIAN_ROSALES} (35-year-old Mexican man, brown skin, short black hair, a short black beard, a tan canvas jacket over a white t-shirt)")
TON = ("@{TONO_CARRILLO} (58-year-old Mexican man, bald with grey sides, a round face, a grey mustache, a red-and-black checked flannel shirt, a white towel over one shoulder)")
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

SEV_B = "@{SEVERO_LECHUGA} seen from behind (black felt cowboy hat, dark-brown leather jacket, heavy-set)"
JUL_B = "@{JULIAN_ROSALES} seen from behind (short black hair, tan canvas jacket)"
TON_B = "@{TONO_CARRILLO} seen from behind (bald head with grey sides, red-and-black checked flannel shirt)"
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

SR = "sitting on the RIGHT at the domino table"
JL = "sitting on the LEFT at the domino table"
TL = "standing on the LEFT by the bar"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Toño YA hablando, inclinado, al oído de Julián; Julián de espaldas (RIGHT).
 ("c01", 6, S("c01", "Toño", f"Medium close-up of {TON} {YARD0}, {TL}, talking from the very first frame, bending down and whispering, nervous, he wipes his hands on the towel", JUL_B, "RIGHT", "nervous, whispering, urgent",
     f"Medium close-up of {TON} {YARD}, {TL}, talking from the very first frame, whispering, nervous", "RIGHT")),
 ("c02", 6, S("c02", "Julián", f"Close-up of {JUL} {YARD0}, {JL}, calm and relaxed, he stacks domino tiles", TON_B, "LEFT", "calm, relaxed, low",
     f"Close-up of {JUL} {YARD}, {JL}, calm, stacking domino tiles", "LEFT")),
 ("c03", 6, S("c03", "Severo", f"Close-up of {SEV} {YARD0}, {SR}, cold and heavy, he taps a domino tile on the table", JUL_B, "LEFT", "cold, heavy, slow",
     f"Close-up of {SEV} {YARD}, {SR}, cold and heavy", "LEFT")),
 ("r1", 6, f"Medium shot of {JUL} {YARD}, {JL}, already in place, he leans back in his chair, calm, holding his gaze, {gaze('RIGHT')}; {ALONE}; {NODOUBLE('man in a tan canvas jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Julián", f"Close-up of {JUL} {YARD0}, {JL}, calm, a small respectful nod", SEV_B, "RIGHT", "calm, respectful",
     f"Close-up of {JUL} {YARD}, {JL}, calm", "RIGHT")),
 ("c05", 6, S("c05", "Severo", f"Close-up of {SEV} {YARD0}, {SR}, suspicious, his eyes narrow", JUL_B, "LEFT", "suspicious, low",
     f"Close-up of {SEV} {YARD}, {SR}, suspicious", "LEFT")),
 ("c06", 6, talk("c06", "Julián", one(f"Close-up of {JUL} {YARD}, {JL}, a calm half smile", "RIGHT"), "calm, mysterious")),
 ("i01", 6, f"Close-up insert {YARD0}: domino tiles are shuffled face down on the wooden table by two hands with silver rings; only the tiles and the hands, no face. No dialogue."),
 ("c07", 6, talk("c07", "Severo", one(f"Close-up of {SEV} {YARD}, {SR}, cold, he pushes his hat back slightly", "LEFT"), "cold, firm")),
 ("c08", 6, S("c08", "Toño", f"Close-up of {TON} {YARD0}, {TL}, nervous and respectful, twisting the towel", SEV_B, "RIGHT", "nervous, pleading, low",
     f"Close-up of {TON} {YARD}, {TL}, nervous", "RIGHT")),
 ("c09", 6, talk("c09", "Severo", one(f"Close-up of {SEV} {YARD}, {SR}, without looking at him, calm and cold", "LEFT"), "calm, cold")),
 ("r2", 6, f"Medium shot of {SEV} {YARD}, {SR}, he slowly takes an old photograph out of his leather jacket and places it face down on the domino table, then rests his hand on it; {SOLO}; {ALONE}; {NODOUBLE('man in a black felt hat')}. Slow push-in. No dialogue."),
 ("c10", D8("c10"), S("c10", "Severo", f"Close-up of {SEV} {YARD0}, {SR}, serious, his hand on the face-down photo", JUL_B, "LEFT", "serious, slow",
     f"Close-up of {SEV} {YARD}, {SR}, serious", "LEFT")),
 ("c11", 6, S("c11", "Julián", f"Close-up of {JUL} {YARD0}, {JL}, serious now, steady", SEV_B, "RIGHT", "serious, steady",
     f"Close-up of {JUL} {YARD}, {JL}, serious", "RIGHT")),
 ("r3", 6, f"Close-up insert {YARD0}: on the wooden table among domino tiles, a hand with silver rings turns over {PHOTO}; only the photo, the tiles and the hand, no face. No dialogue."),
 ("c12", 6, talk("c12", "Severo", one(f"Close-up of {SEV} {YARD}, {SR}, looking down at the photo, his hard face softens, his eyes shine", "LEFT"), "low, nostalgic, slow")),
 ("c13", 6, talk("c13", "Julián", one(f"Close-up of {JUL} {YARD}, {JL}, staring at the photo, shaken, his voice breaks", "RIGHT"), "shaken, low, emotional")),
 ("r4", 6, one(f"Close-up of {SEV} {YARD}, {SR}, in silence, stunned, he slowly lifts his eyes from the photo to the young man, his lips part", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Julián solo, a cámara
 ("c14", 10, talk("c14", "Julián", f"Close-up from the chest up of {JUL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, picks up a domino tile and turns it between his fingers, raises one eyebrow, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si pierdes, me dices quién te mandó.", "Si pierdes, me dices a qué viniste."), ("Tú sirve los tequilas, Toño.", "Tú sirve las bebidas, Toño."),
        ("stunned", "surprised"), ("shaken", "moved"), ("suspicious", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light in an old traditional cantina in Zacatecas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican cantina with a domino table, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm low light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERO_LECHUGA}", "a heavy-set Mexican man in his sixties with a thick grey mustache, a black felt cowboy hat and a dark-brown leather jacket"),
         ("@{JULIAN_ROSALES}", "a Mexican man in his thirties with short black hair, a short black beard and a tan canvas jacket"),
         ("@{TONO_CARRILLO}", "a bald Mexican man in his fifties with a grey mustache, a red-and-black checked flannel shirt and a towel on his shoulder"),
         (" @{LOC_CANTINAJEREZ}", "")]
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
