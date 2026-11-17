"""Genera los clips de sobre-alamos PARTE 1 (El Sobre de Álamos, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #7 "La silla vacía" [CAPO], cierre tipo 2 (se lee un documento y se corta antes del dato clave): en la lectura del testamento del hacendado don Ignacio Robles, en Álamos, Sonora,
el notario Barragán (60) pide esperar a un heredero más. Los hijos Fernando (45) y Lorena (42) se burlan. Entra el capataz Nicanor (62) y se sienta en la silla vacía. El notario abre un sobre con su
nombre: "Nicanor Durán no es mi empleado… Nicanor Durán es mi…" Corte.
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
# Geografía fija (despacho): Fernando y Lorena sentados a la IZQUIERDA de la mesa; el notario de pie a la DERECHA en la cabecera; la silla vacía y la puerta a la DERECHA.
YARD0 = ("in the study of an old colonial hacienda in Álamos, Sonora @{LOC_DESPACHOALAMOS} in the afternoon: thick white walls, a tall wooden door, a long dark wooden table with high-backed leather chairs, "
         "one empty leather armchair at the end, bookshelves, a barred window with sunlight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ENV = "a thick cream envelope closed with a red wax seal"
BAR = ("@{LIC_BARRAGAN} (60-year-old Mexican man, thin, light skin, white hair neatly combed, round tortoiseshell glasses, a charcoal-grey three-piece suit, a dark-green tie)")
FER = ("@{FERNANDO_ROBLES} (45-year-old Mexican man, fair skin, short light-brown hair, a trimmed beard, a black suit jacket over a white open-collar shirt)")
LOR = ("@{LORENA_ROBLES} (42-year-old Mexican woman, fair skin, shoulder-length blonde-highlighted hair, sunglasses pushed on her head, a black fitted mourning dress, a pearl necklace)")
NIC = ("@{NICANOR_DURAN} (62-year-old Mexican man, dark sun-tanned wrinkled skin, short grey hair, a grey mustache, a faded denim shirt buttoned to the neck, holding a beige straw cowboy hat)")
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

BAR_B = "@{LIC_BARRAGAN} seen from behind (white neatly combed hair, charcoal-grey suit)"
FER_B = "@{FERNANDO_ROBLES} seen from behind (short light-brown hair, black suit jacket)"
LOR_B = "@{LORENA_ROBLES} seen from behind (shoulder-length blonde-highlighted hair, black dress)"
NIC_B = "@{NICANOR_DURAN} seen from behind (short grey hair, faded denim shirt)"
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

BR = "standing on the RIGHT at the head of the long table"
FL = "sitting on the LEFT at the long table"
LL = "sitting on the LEFT at the long table, legs crossed"
NR = "standing on the RIGHT by the tall wooden door"
NS = "sitting on the RIGHT in the leather armchair at the end of the table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): el notario YA hablando, la mano sobre el respaldo de la silla vacía; Fernando de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "el notario", f"Medium close-up of {BAR} {YARD0}, {BR}, talking from the very first frame, solemn, his hand resting on the back of the empty leather armchair", FER_B, "LEFT", "solemn, calm, slow",
     f"Medium close-up of {BAR} {YARD}, {BR}, talking from the very first frame, solemn", "LEFT")),
 ("c02", 6, S("c02", "Fernando", f"Close-up of {FER} {YARD0}, {FL}, impatient and arrogant, he checks his gold watch", BAR_B, "RIGHT", "impatient, arrogant",
     f"Close-up of {FER} {YARD}, {FL}, impatient", "RIGHT")),
 ("c03", 6, talk("c03", "Lorena", one(f"Close-up of {LOR} {YARD}, {LL}, a mocking smile, she rolls her eyes", "RIGHT"), "mocking, bored")),
 ("i01", 6, f"Close-up insert {YARD0}: the empty high-backed leather armchair at the end of the long wooden table, a ray of sunlight from the barred window falls on it; no people. No dialogue."),
 ("r1", 6, f"Medium shot of {NIC} {YARD}, {NR}, already standing in place in the doorway, humble and serious, holding his straw hat against his chest, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a faded denim shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Fernando", f"Close-up of {FER} {YARD0}, {FL}, annoyed and superior", NIC_B, "RIGHT", "annoyed, superior",
     f"Close-up of {FER} {YARD}, {FL}, annoyed", "RIGHT")),
 ("c05", 6, S("c05", "el notario", f"Close-up of {BAR} {YARD0}, {BR}, respectful, he pulls out the empty armchair with one hand", NIC_B, "RIGHT", "respectful, calm",
     f"Close-up of {BAR} {YARD}, {BR}, respectful", "RIGHT")),
 ("c06", 6, S("c06", "Lorena", f"Close-up of {LOR} {YARD0}, {LL}, she laughs, outraged", BAR_B, "RIGHT", "outraged, mocking",
     f"Close-up of {LOR} {YARD}, {LL}, outraged", "RIGHT")),
 ("c07", 6, S("c07", "Nicanor", f"Close-up of {NIC} {YARD0}, {NR}, humble and confused, turning his hat in his hands", LOR_B, "LEFT", "humble, confused, low",
     f"Close-up of {NIC} {YARD}, {NR}, humble and confused", "LEFT")),
 ("r2", 6, f"Medium shot of {NIC} {YARD}, he slowly sits down in the leather armchair at the end of the table, uncomfortable, and places his straw hat on his knee; {SOLO}; {ALONE}; {NODOUBLE('man in a faded denim shirt')}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "el notario", one(f"Close-up of {BAR} {YARD}, {BR}, holding up {ENV}, serious", "LEFT"), "serious, solemn")),
 ("c09", 6, S("c09", "Fernando", f"Close-up of {FER} {YARD0}, {FL}, contemptuous, leaning back", BAR_B, "RIGHT", "contemptuous, impatient",
     f"Close-up of {FER} {YARD}, {FL}, contemptuous", "RIGHT")),
 ("r3", 6, f"Close-up insert {YARD0}: hands in a charcoal-grey suit break the red wax seal of {ENV} and unfold a handwritten letter; only the hands and the paper, no readable text, no face. No dialogue."),
 ("c10", D8("c10"), talk("c10", "el notario", one(f"Close-up of {BAR} {YARD}, {BR}, reading aloud from a handwritten letter, he adjusts his glasses, solemn", "LEFT"), "solemn, reading aloud, slow")),
 ("c11", 6, talk("c11", "Lorena", one(f"Close-up of {LOR} {YARD}, {LL}, her smile gone, she sits up straight, nervous", "RIGHT"), "nervous, sharp")),
 ("c12", 6, talk("c12", "el notario", one(f"Close-up of {BAR} {YARD}, {BR}, reading the letter, he stops mid-sentence and slowly looks up toward the man in the armchair", "LEFT"), "solemn, slow, hesitant")),
 ("r4", 6, one(f"Close-up of {NIC} {YARD}, {NS}, in silence, his eyes wide, his hands tighten on his straw hat", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Nicanor solo, a cámara
 ("c13", 10, talk("c13", "Nicanor", f"Close-up from the chest up of {NIC} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts on his straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small humble half smile. Nobody else around.",
     "charismatic, humble, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Licenciado, esto tiene que ser una broma.", "Licenciado, esto no puede ser."), ("contemptuous", "impatient"), ("outraged", "surprised"),
        ("break the red wax seal of", "open"),
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
          "Vertical scene from a Mexican TV drama, realistic, afternoon sunlight in the study of an old colonial hacienda in Sonora, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial hacienda study with a long wooden table, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LIC_BARRAGAN}", "a thin Mexican man around sixty with neatly combed white hair, round tortoiseshell glasses and a charcoal-grey three-piece suit"),
         ("@{FERNANDO_ROBLES}", "a Mexican man in his forties with short light-brown hair, a trimmed beard and a black suit jacket over a white shirt"),
         ("@{LORENA_ROBLES}", "a Mexican woman in her forties with blonde-highlighted hair, sunglasses on her head and a black dress with pearls"),
         ("@{NICANOR_DURAN}", "a Mexican man in his sixties with dark tanned skin, a grey mustache, a faded denim shirt and a straw cowboy hat"),
         (" @{LOC_DESPACHOALAMOS}", "")]
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
