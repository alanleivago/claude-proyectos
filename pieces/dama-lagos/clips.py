"""Genera los clips de dama-lagos PARTE 1 (La Dama de Compañía, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #52 "La gata del rancho" [CAPO] (Patronas y haciendas), cierre tipo 3 (palabra reveladora: un nombre): en el comedor de la casa grande de una hacienda en Lagos de Moreno,
la nieta rica Paulina (26) no quiere que Macrina (23), la nueva dama de compañía de su abuela, se siente a la mesa. La matriarca Benigna (76) la sienta y le pregunta quién le enseñó a hablar tan derecho:
"Mi papá… Ventura Altamirano", el tío que se fue de la casa. Benigna se congela; Paulina se queda sin habla.
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
# Geografía fija (comedor): Benigna SENTADA a la DERECHA en la cabecera; Paulina DE PIE a la DERECHA junto a la silla de la abuela; Macrina DE PIE a la IZQUIERDA junto a una silla vacía.
ROOM0 = ("in the large old dining room of a colonial hacienda house in Lagos de Moreno, Jalisco @{LOC_COMEDORLAGOS} in the morning: a long dark wooden table with a white embroidered tablecloth, porcelain plates, a silver coffee pot, "
         "heavy carved wooden chairs, thick white walls, warm sunlight through tall windows; no readable text, no signs, no logos")
ROOM = ROOM0 + "; nobody else in the background, no extras, nobody besides the person described"
BEN = ("@{BENIGNA_ALTAMIRANO} (76-year-old Mexican woman, fair wrinkled skin, silver-white hair in a tight low bun, sharp pale-brown eyes, a high-necked black dress with a small gold brooch)")
PAU = ("@{PAULINA_ALTAMIRANO} (26-year-old Mexican woman, light skin, long straight light-brown hair with honey highlights, nude lipstick, a cream silk blouse, gold hoop earrings)")
MAC = ("@{MACRINA_LEAL} (23-year-old Mexican woman, warm brown skin, thick black hair in one long braid over her shoulder, strong dark eyebrows, a white cotton blouse with red embroidered flowers)")
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

BEN_B = "@{BENIGNA_ALTAMIRANO} seen from behind (silver-white hair in a tight low bun, high-necked black dress), seated"
PAU_B = "@{PAULINA_ALTAMIRANO} seen from behind (long light-brown hair with honey highlights, cream silk blouse)"
MAC_B = "@{MACRINA_LEAL} seen from behind (one long thick black braid, white embroidered blouse)"
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

BR = "seated on the RIGHT at the head of the table"
PR = "standing on the RIGHT beside the grandmother's chair at the head of the table"
ML = "standing on the LEFT beside an empty carved chair at the table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Paulina YA hablando, despectiva, Macrina de espaldas en el borde.
 ("c01", 6, S("c01", "Paulina", f"Medium close-up of {PAU} {ROOM0}, {PR}, talking from the very first frame, dismissive, looking down at the young woman, arms crossed", MAC_B, "LEFT", "dismissive, cold, spoiled",
     f"Medium close-up of {PAU} {ROOM}, {PR}, talking from the very first frame, dismissive", "LEFT")),
 ("c02", 6, S("c02", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, chin up, proud, holding the gaze without blinking, firm but calm", PAU_B, "RIGHT", "proud, firm, calm",
     f"Close-up of {MAC} {ROOM}, {ML}, chin up, proud", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Paulina", f"Close-up of {PAU} {ROOM0}, {PR}, a mocking smile, rolling her eyes, then hard", MAC_B, "LEFT", "mocking, cold, cutting",
     f"Close-up of {PAU} {ROOM}, {PR}, mocking smile", "LEFT")),
 ("c04", 6, S("c04", "Benigna", f"Close-up of {BEN} {ROOM0}, {BR}, she sets down her porcelain cup and speaks with total authority, without raising her voice", PAU_B, "RIGHT", "authoritative, calm, cold",
     f"Close-up of {BEN} {ROOM}, {BR}, total authority, setting down her cup", "LEFT")),
 ("c05", 6, S("c05", "Paulina", f"Close-up of {PAU} {ROOM0}, {PR}, turning to her grandmother, offended, pointing with her chin at the young woman", BEN_B, "LEFT", "offended, whiny, scornful",
     f"Close-up of {PAU} {ROOM}, {PR}, offended", "LEFT")),
 ("c06", D8("c06"), S("c06", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, she pulls the empty chair back slowly, dignified, voice steady", PAU_B, "RIGHT", "dignified, steady, proud",
     f"Close-up of {MAC} {ROOM}, {ML}, dignified, voice steady", "RIGHT")),
 ("c07", 6, S("c07", "Benigna", f"Close-up of {BEN} {ROOM0}, {BR}, a faint approving half-smile, then a cold look up at her granddaughter", PAU_B, "RIGHT", "dry, amused, stern",
     f"Close-up of {BEN} {ROOM}, {BR}, faint approving half-smile", "LEFT")),
 ("c08", 6, S("c08", "Paulina", f"Close-up of {PAU} {ROOM0}, {PR}, leaning slightly toward the young woman, a sweet sly smile, talking low", MAC_B, "LEFT", "low, sweet, sly",
     f"Close-up of {PAU} {ROOM}, {PR}, sweet sly smile, talking low", "LEFT")),
 ("c09", 6, S("c09", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, back straight, she answers calmly, unafraid", PAU_B, "RIGHT", "calm, unafraid, firm",
     f"Close-up of {MAC} {ROOM}, {ML}, back straight, unafraid", "RIGHT")),
 ("c10", 6, S("c10", "Benigna", f"Close-up of {BEN} {ROOM0}, {BR}, curious, studying the young woman's face closely, a slight tilt of the head", MAC_B, "LEFT", "curious, slow, probing",
     f"Close-up of {BEN} {ROOM}, {BR}, curious, studying her", "LEFT")),
 ("c11", 6, S("c11", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, she looks the old woman straight in the eyes, a small pause, then says the name softly and clearly", BEN_B, "RIGHT", "soft, clear, meaningful",
     f"Close-up of {MAC} {ROOM}, {ML}, looking straight ahead, soft and clear", "RIGHT")),
 ("i01", 6, f"Close-up insert {ROOM0}: an old wrinkled hand with a gold ring lets a small silver spoon slip; it falls onto a white porcelain saucer; no faces, no readable text. No dialogue."),
 ("r1", 6, one(f"Close-up of {BEN} {ROOM}, {BR}, frozen, her stern face breaks, her eyes fill with surprise and old sadness, her lips part, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r2", 6, one(f"Close-up of {PAU} {ROOM}, {PR}, stunned, her smile gone, she slowly turns her head toward her grandmother, mouth slightly open", "LEFT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Macrina a cámara
 ("c12", 10, talk("c12", "Macrina", f"Close-up from the chest up of {MAC} {ROOM}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, brushes her long braid back over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("dismissive, cold, spoiled", "cold, spoiled"), ("mocking, cold, cutting", "mocking, cold"), ("scornful", "annoyed"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm morning light in the dining room of a colonial hacienda in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda dining room with a long wooden table in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{BENIGNA_ALTAMIRANO}", "a stern Mexican woman in her seventies with silver-white hair in a low bun and a high-necked black dress"),
         ("@{PAULINA_ALTAMIRANO}", "a Mexican woman in her twenties with long light-brown hair with honey highlights and a cream silk blouse"),
         ("@{MACRINA_LEAL}", "a young Mexican woman with one long black braid and a white blouse with red embroidered flowers"),
         (" @{LOC_COMEDORLAGOS}", "")]
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
