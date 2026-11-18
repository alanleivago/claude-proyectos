"""Genera los clips de traje-zamora PARTE 1 (El Sastre de Zamora, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #5 "El sastre del pueblo" [CAPO] (Identidad oculta), cierre tipo 1 (entra un personaje inesperado): el cacique don Fulgencio (64) manda hacer su traje de boda con el sastre Abundio (62).
Al medirlo, Abundio reconoce la cicatriz de su mano: es el hombre que se llevó a su prometida una semana antes de la boda. Fulgencio se burla. Entra la novia, Amparo (58), y se queda helada al ver al sastre.
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
# Geografía fija (sastrería): Fulgencio a la DERECHA frente al espejo alto; Abundio a la IZQUIERDA junto al mostrador; Amparo entra por la puerta de madera y vidrio.
YARD0 = ("inside an old tailor shop in the historic center of Zamora, Michoacán @{LOC_SASTRERIAZAMORA} in the afternoon: dark wooden counter, shelves with bolts of fabric, an antique black sewing machine, "
         "a dressmaker mannequin with a half-made black suit jacket, a tall standing mirror, warm sunlight through a tall window; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
FUL = ("@{FULGENCIO_RANGEL} (64-year-old Mexican man, tanned light skin, thick grey hair combed back, a grey goatee, heavy eyebrows, a white dress shirt with a black vest and a gold pocket-watch chain)")
ABU = ("@{ABUNDIO_TREVINO} (62-year-old Mexican man, light-brown skin, thin face, neatly combed grey hair, round wire-rimmed glasses, a brown knitted cardigan, a yellow measuring tape around his neck)")
AMP = ("@{AMPARO_LEDESMA} (58-year-old Mexican woman, fair skin, shoulder-length wavy chestnut hair, small gold earrings, a pale-rose silk dress with long sleeves, a cream shawl)")
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

FUL_B = "@{FULGENCIO_RANGEL} seen from behind (thick grey hair combed back, black vest over a white shirt)"
ABU_B = "@{ABUNDIO_TREVINO} seen from behind (neatly combed grey hair, brown knitted cardigan)"
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

FR = "standing on the RIGHT in front of the tall mirror"
AL = "standing on the LEFT by the wooden counter"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fulgencio YA hablando, arrogante, Abundio de espaldas en el borde.
 ("c01", 6, S("c01", "Fulgencio", f"Medium close-up of {FUL} {YARD0}, {FR}, talking from the very first frame, arrogant and pleased with himself, arms slightly open", ABU_B, "LEFT", "arrogant, proud, loud",
     f"Medium close-up of {FUL} {YARD}, {FR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, quiet and polite, he takes the measuring tape from his neck", FUL_B, "RIGHT", "quiet, polite, humble",
     f"Close-up of {ABU} {YARD}, {AL}, quiet and polite, holding the measuring tape", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, arms raised to be measured, smug, looking at himself in the mirror", ABU_B, "LEFT", "smug, condescending",
     f"Close-up of {FUL} {YARD}, {FR}, arms raised, smug", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a man's raised right hand and forearm in a rolled-up WHITE dress-shirt sleeve (no jacket, no dark sleeve), a gold ring, and a long thick pale old scar clearly visible running diagonally across the back of the hand; a yellow measuring tape held against the wrist; the scar is the focus, sharp and obvious; only the arm and hand, no faces. No dialogue."),
 ("r1", 6, one(f"Close-up of {ABU} {YARD}, {AL}, frozen, staring down at something, behind his glasses his eyes widen, the measuring tape still in his hands, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, he lowers his arms, annoyed and suspicious, rubbing the back of his right hand", ABU_B, "LEFT", "annoyed, suspicious, curt",
     f"Close-up of {FUL} {YARD}, {FR}, annoyed and suspicious", "LEFT")),
 ("c05", 6, S("c05", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, calm on the surface, his jaw tight, he slowly takes off his glasses", FUL_B, "RIGHT", "calm, contained, slow",
     f"Close-up of {ABU} {YARD}, {AL}, calm, slowly taking off his glasses", "RIGHT")),
 ("c06", 6, S("c06", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, a cold half smile, warning him with one raised finger", ABU_B, "LEFT", "cold, warning, superior",
     f"Close-up of {FUL} {YARD}, {FR}, a cold half smile", "LEFT")),
 ("c07", D8("c07"), S("c07", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, eyes wet but steady, an old pain in his voice", FUL_B, "RIGHT", "painful, low, steady",
     f"Close-up of {ABU} {YARD}, {AL}, eyes wet but steady", "RIGHT")),
 ("c08", 6, S("c08", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, a short cruel laugh, he adjusts his vest in the mirror", ABU_B, "LEFT", "mocking, cruel, relaxed",
     f"Close-up of {FUL} {YARD}, {FR}, a short laugh, adjusting his vest", "LEFT")),
 ("c09", 6, S("c09", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, dignified, he puts his glasses back on, a faint enigmatic smile", FUL_B, "RIGHT", "dignified, quiet, enigmatic",
     f"Close-up of {ABU} {YARD}, {AL}, dignified, a faint smile", "RIGHT")),
 ("c10", 6, S("c10", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, he turns his head toward the front door, smiling proudly", ABU_B, "LEFT", "proud, pleased, warm",
     f"Close-up of {FUL} {YARD}, {FR}, turning toward the door, smiling proudly", "LEFT")),
 ("r2", 6, one(f"Medium shot of {AMP} {YARD}, standing just inside the wooden front door of the tailor shop, she was smiling, then her smile fades, one hand goes to her chest, she stares at someone across the room, frozen", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", 6, talk("c11", "Fulgencio", two(f"{FUL} on the RIGHT and {AMP} on the LEFT {YARD0}, framed from the waist up near the front door; he holds her arm, confused, looking at her pale face; "
     f"she does not look at him, she stares past him toward the counter") + " " + MOUTH("Fulgencio", "Amparo"), "confused, uneasy, gentle")),
 ("r3", 6, one(f"Close-up of {ABU} {YARD}, {AL}, looking toward the front door, the yellow measuring tape slowly slips from his fingers, his eyes fill with tears, no words", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Abundio a cámara
 ("c12", 10, talk("c12", "Abundio", f"Close-up from the chest up of {ABU} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts his round glasses, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("mocking, cruel", "amused"), ("cruel", "proud"), ("mocking", "amused"), ("arrogant", "proud"), ("condescending", "superior"), ("painful", "sad"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light inside an old tailor shop in Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old tailor shop with bolts of fabric in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FULGENCIO_RANGEL}", "a powerful Mexican man in his sixties with grey hair combed back, a grey goatee, a white shirt and a black vest with a gold watch chain"),
         ("@{ABUNDIO_TREVINO}", "a thin Mexican tailor in his sixties with combed grey hair, round wire glasses, a brown cardigan and a yellow measuring tape around his neck"),
         ("@{AMPARO_LEDESMA}", "an elegant Mexican woman in her late fifties with wavy chestnut hair, a pale-rose silk dress and a cream shawl"),
         (" @{LOC_SASTRERIAZAMORA}", "")]
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
