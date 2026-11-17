"""Genera los clips de arbol-metepec PARTE 1 (El Árbol de Metepec, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> traidor en casa, como el modelo 7704056500502793502): en el mercado de artesanías de Metepec,
Uriel (36) le rompe a Jazmín (27) el árbol de la vida que tenía encargado y le da plazo "antes de que acabe la feria"; llega la dueña del encargo, doña Amparo (70), matriarca para la que
trabaja el papá de Uriel. Plazo invertido. Giro: el puesto ya lo firmó a escondidas Ramiro (31), el marido de Jazmín.
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
# Geografía fija (pasillo del mercado): Jazmín SIEMPRE a la IZQUIERDA detrás de su puesto de árboles de la vida; Uriel, Amparo y Ramiro a la DERECHA en el pasillo.
YARD0 = ("in an artisan market aisle in Metepec, State of Mexico @{LOC_MERCADOMETEPEC} during the day: small stalls full of colorful painted clay trees of life, clay suns and pottery on wooden shelves, "
         "colorful plain paper banners overhead, a stone floor, soft daylight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
TREE = "a large colorful painted clay tree of life"
PHONE = "a smartphone"
JAZ = ("@{JAZMIN_ESQUIVEL} (27-year-old Mexican woman, light-brown skin, black hair in a high ponytail tied with a red ribbon, a mustard-yellow t-shirt, a denim apron with small paint stains)")
URI = ("@{URIEL_SAUCEDO} (36-year-old Mexican man, stocky, light-brown skin, black hair shaved on the sides with a gelled top, a black goatee, a burgundy velvet bomber jacket over a black t-shirt, two gold rings)")
AMP = ("@{AMPARO_VILLALBA} (70-year-old elegant Mexican matriarch, light skin, silver hair in an elegant low bun, a black shawl over a black dress, a pearl necklace, big gold rings)")
RAM = ("@{RAMIRO_LUNA} (31-year-old Mexican man, thin, brown skin, messy short black hair, light stubble, a grey hoodie)")
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

# Bordes: los de la DERECHA le hablan a Jazmín -> espalda de ella LEFT; Jazmín les habla -> espalda de ellos RIGHT.
JAZ_B = "@{JAZMIN_ESQUIVEL} seen from behind (black high ponytail with a red ribbon, mustard-yellow t-shirt, denim apron straps)"
URI_B = "@{URIEL_SAUCEDO} seen from behind (black hair shaved on the sides, burgundy velvet bomber jacket, stocky)"
AMP_B = "@{AMPARO_VILLALBA} seen from behind (silver hair in a low bun, black shawl over the shoulders)"
RAM_B = "@{RAMIRO_LUNA} seen from behind (messy short black hair, grey hoodie, thin)"
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

JL = "standing on the LEFT behind her stall of painted clay trees of life"       # Jazmín
UR = "standing on the RIGHT in the market aisle, leaning on the stall"            # Uriel
AR = "standing on the RIGHT in the market aisle"                                  # Amparo
RR = "standing on the RIGHT at the corner of the stall"                           # Ramiro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Uriel YA hablando, recargado en el puesto, toca un árbol de barro; Jazmín de espaldas (LEFT). Plazo: antes de que acabe la feria.
 ("c01", D8("c01"), S("c01", "Uriel", f"Medium close-up of {URI} {YARD0}, {UR}, talking from the very first frame, arrogant, he taps a small clay figure with one finger", JAZ_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {URI} {YARD}, {UR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, firm and proud, she raises her chin", URI_B, "RIGHT", "firm, proud",
     f"Close-up of {JAZ} {YARD}, {JL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, a cocky smile, he shakes his head", "LEFT"), "cocky, mocking, cold")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with two gold rings slowly pushes {TREE} off the edge of a wooden shelf and it breaks into colorful pieces on the stone floor; only the hand, the clay and the floor, no face. No dialogue."),
 ("c04", 6, S("c04", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, her eyes shine, she looks down at the broken clay, indignant", URI_B, "RIGHT", "hurt, indignant",
     f"Close-up of {JAZ} {YARD}, {JL}, her eyes shine, indignant", "RIGHT")),
 ("c05", 6, talk("c05", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, laughing, he spreads his hands", "LEFT"), "mocking, cruel")),
 ("r1", 6, f"Medium shot of {AMP} {YARD}, {AR}, already standing in place in the middle of the aisle, she slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in black')}. Slow push-in. No dialogue."),
 ("c06", D8("c06"), talk("c06", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, calm and cold, she looks at the broken clay", "LEFT"), "calm, cold, slow")),
 ("c07", 6, talk("c07", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, he turns his head, cocky and annoyed", "RIGHT"), "cocky, annoyed")),
 ("c08", 6, talk("c08", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, a small cold smile, completely calm", "LEFT"), "calm, cold, slow")),
 ("r2", 6, f"Medium shot of {URI} {YARD}, {UR}, he takes {PHONE} out of his jacket and dials quickly, his smile slowly disappears, "
           f"{SOLO}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c09", D8("c09"), talk("c09", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, holding {PHONE} to his ear, nervous, his face pale", "RIGHT"), "nervous, quick")),
 ("c10", D8("c10"), talk("c10", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, serious and powerful, she looks at the young man", "LEFT"), "serious, cold, slow")),
 ("c11", 6, talk("c11", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, nervous, a forced smile, he lowers the phone", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, she points with her chin at the broken clay on the floor, cold and final", "LEFT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {URI} {YARD}, kneeling on the stone floor, he picks up colorful pieces of broken clay one by one, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a burgundy jacket')}. No dialogue."),
 ("c13", 6, S("c13", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, grateful, her eyes shine", AMP_B, "RIGHT", "grateful, soft",
     f"Close-up of {JAZ} {YARD}, {JL}, grateful, her eyes shine", "RIGHT")),
 ("c14", 6, S("c14", "Amparo", f"Close-up of {AMP} {YARD0}, {AR}, warm, a small kind smile", JAZ_B, "LEFT", "warm, kind, slow",
     f"Close-up of {AMP} {YARD}, {AR}, warm, a small kind smile", "LEFT")),
 ("c15", 6, talk("c15", "Uriel", one(f"Close-up of {URI} {YARD}, kneeling on the stone floor, a piece of clay in his hand, a resentful smile, his voice low", "RIGHT"), "resentful, low")),
 ("c16", 6, talk("c16", "Jazmín", one(f"Close-up of {JAZ} {YARD}, {JL}, confused, worried", "RIGHT"), "confused, worried")),
 ("c17", 6, S("c17", "Uriel", f"Close-up of {URI} {YARD0}, kneeling, he looks up with a mean smile", JAZ_B, "LEFT", "mean, slow, amused",
     f"Close-up of {URI} {YARD}, kneeling, a mean smile", "LEFT")),
 ("r4", 6, f"Medium shot of {RAM} {YARD}, {RR}, already in place, he stops with his hands in his hoodie pockets and lowers his eyes, guilty, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey hoodie')}. Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, shocked and hurt, her voice breaks", RAM_B, "RIGHT", "shocked, hurt",
     f"Close-up of {JAZ} {YARD}, {JL}, shocked and hurt", "RIGHT")),
 ("c19", 6, S("c19", "Ramiro", f"Close-up of {RAM} {YARD0}, {RR}, ashamed, he cannot look at her", JAZ_B, "LEFT", "ashamed, low, quick",
     f"Close-up of {RAM} {YARD}, {RR}, ashamed", "LEFT")),
 ("c20", 6, talk("c20", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, she turns slowly to the husband, cold contempt", "LEFT"), "cold, contemptuous, slow")),
 # CTA con carisma (después del BLACK): Jazmín sola, a cámara
 ("c21", 10, talk("c21", "Jazmín", f"Close-up from the chest up of {JAZ} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts the red ribbon in her ponytail, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Tu abuela ya no está para defenderte.", "Tu abuela ya no está aquí."), ("Entonces eres peor que este muchacho.", "Entonces no eres mejor que este muchacho."),
        ("breaks into colorful pieces on the stone floor", "lands on the stone floor in pieces"), ("pushes", "moves"), ("a mean smile", "a smile"), ("cold contempt", "serious"),
        ("contemptuous", "cool"), ("humiliated", "quiet"), ("shocked and hurt", "surprised"), ("her voice breaks", "softly"), ("his face pale", "quiet"),
        ("resentful", "serious"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, soft daylight in an artisan market aisle full of painted clay trees of life in Metepec, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican artisan market with colorful clay pottery stalls, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{JAZMIN_ESQUIVEL}", "a Mexican woman in her twenties with a high black ponytail with a red ribbon, a mustard-yellow t-shirt and a denim apron"),
         ("@{URIEL_SAUCEDO}", "a stocky Mexican man in his thirties with a black goatee, gelled hair and a burgundy velvet bomber jacket"),
         ("@{AMPARO_VILLALBA}", "an elegant elderly Mexican woman with silver hair in a bun, a black shawl and a pearl necklace"),
         ("@{RAMIRO_LUNA}", "a thin Mexican man in his early thirties with messy black hair and a grey hoodie"),
         (" @{LOC_MERCADOMETEPEC}", "")]
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
