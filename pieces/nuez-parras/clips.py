"""Genera los clips de nuez-parras PARTE 1 (La Nuez de Parras, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada al hijo perdido -> el hijo es el jefe del villano -> plazo invertido -> giro familiar): en una nogalera de Parras, Coahuila,
Ulises (35) le tira la nuez a don Anacleto (74) y le da plazo "antes de que acabe la cosecha"; doña Refugio (68) le pide que llame a Mateo (40), el hijo que no ve hace quince años.
Mateo llega: Ulises trabaja para él. Giro: Ulises es hijo de Anacleto con otra mujer, hermano de Mateo.
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
# Geografía fija (nogalera): Anacleto y Refugio a la IZQUIERDA (junto a los costales y la casa de adobe); Ulises y Mateo a la DERECHA (del lado del camino de tierra).
YARD0 = ("in a pecan orchard in Parras de la Fuente, Coahuila @{LOC_NOGALERA} during the autumn harvest in the late afternoon: rows of tall pecan trees with yellowing leaves, burlap sacks of pecans "
         "on the ground, an old adobe farmhouse, dry desert mountains behind, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
SACK = "a burlap sack full of pecans"
PHONE = "an old small flip phone"
ANA = ("@{ANACLETO_DAVILA} (74-year-old Mexican man, thin, sun-weathered light-brown skin, white hair, white stubble, a beige straw hat, a faded denim work shirt)")
REF = ("@{REFUGIO_DAVILA} (68-year-old Mexican woman, plump, light-brown skin, short grey permed hair, small glasses on a chain, a blue cardigan over a floral print dress)")
ULI = ("@{ULISES_GARZA} (35-year-old Mexican man, tall and strong, light-brown skin, shaved head, a short black beard, mirrored sunglasses on his head, an olive-green bomber jacket over a grey t-shirt)")
MAT = ("@{MATEO_DAVILA} (40-year-old Mexican man, light-brown skin, short black hair with grey temples, clean-shaven, a charcoal-grey suit with an open white shirt)")
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

# Bordes: Ulises o Mateo le hablan a Anacleto/Refugio -> espalda LEFT; Anacleto o Refugio les hablan -> espalda RIGHT.
ANA_B = "@{ANACLETO_DAVILA} seen from behind (beige straw hat, faded denim work shirt, thin)"
REF_B = "@{REFUGIO_DAVILA} seen from behind (short grey permed hair, blue cardigan)"
ULI_B = "@{ULISES_GARZA} seen from behind (shaved head, olive-green bomber jacket, broad shoulders)"
MAT_B = "@{MATEO_DAVILA} seen from behind (short black hair with grey at the sides, charcoal-grey suit jacket)"
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

AL = f"standing on the LEFT beside {SACK} under a pecan tree"      # Anacleto
FL = "standing on the LEFT in front of the old adobe farmhouse"     # Refugio
UR = "standing on the RIGHT, leaning on a black pickup truck"       # Ulises
MR = "standing on the RIGHT on the dirt road"                       # Mateo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ulises YA hablando recargado en su camioneta; Anacleto de espaldas (LEFT). Plazo: antes de que acabe la cosecha.
 ("c01", D8("c01"), S("c01", "Ulises", f"Medium close-up of {ULI} {YARD0}, {UR}, talking from the very first frame, arrogant, he points at the orchard with his chin", ANA_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {ULI} {YARD}, {UR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Anacleto", f"Close-up of {ANA} {YARD0}, {AL}, firm and proud", ULI_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {ANA} {YARD}, {AL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, a cocky smile, he spreads his arms", "LEFT"), "cocky, mocking")),
 ("r1", 6, f"Medium shot of {REF} {YARD}, {FL}, already in place, she steps out of the farmhouse door wiping her hands on a cloth and stops, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in a blue cardigan')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Refugio", f"Close-up of {REF} {YARD0}, {FL}, worried, pleading softly", ULI_B, "RIGHT", "worried, pleading, soft",
     f"Close-up of {REF} {YARD}, {FL}, worried", "RIGHT")),
 ("c05", 6, S("c05", "Ulises", f"Close-up of {ULI} {YARD0}, {UR}, he laughs once with contempt", REF_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {ULI} {YARD}, {UR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a black boot slowly tips over {SACK} and the brown pecans spill across the dry dirt; only the boot, the sack and the pecans, no face. No dialogue."),
 ("c06", 6, S("c06", "Anacleto", f"Close-up of {ANA} {YARD0}, {AL}, his eyes shine, indignant but dignified", ULI_B, "RIGHT", "hurt, indignant",
     f"Close-up of {ANA} {YARD}, {AL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, laughing, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {ANA} {YARD}, he slowly kneels on the dry dirt and starts picking up pecans one by one with shaking hands, dignified, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a straw hat')}. No dialogue."),
 ("c08", D8("c08"), (talk("c08", "Refugio", two(f"{REF} on the LEFT and {ANA} on the RIGHT, close together beside the spilled pecans {YARD0}, framed from the waist up; "
     f"Refugio speaks softly and urgently to her husband, slightly closer to the camera and in sharper focus") + " " + MOUTH("Refugio", "Anacleto"), "soft, urgent, low"),
   talk("c08", "Refugio", one(f"Close-up of {REF} {YARD}, {FL}, soft and urgent, looking at her husband", "RIGHT"), "soft, urgent, low"))),
 ("r3", 6, f"Medium shot of {ANA} {YARD}, {AL}, he takes {PHONE} out of his shirt pocket, hesitates, then slowly presses a number with his thumb, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Anacleto", one(f"Close-up of {ANA} {YARD}, {AL}, holding {PHONE} to his ear, his voice breaks, his eyes shine", "RIGHT"), "emotional, low, humble")),
 ("i02", 6, "Wide shot of two black SUVs driving slowly along a dusty dirt road between rows of tall pecan trees in Parras, Coahuila, golden afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r4", 6, f"Medium shot of {MAT} {YARD}, {MR}, already standing in place, a black SUV behind him, he slowly takes off dark sunglasses, moved and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a charcoal suit')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Mateo", f"Close-up of {MAT} {YARD0}, {MR}, moved, his eyes shine, a small smile", ANA_B, "LEFT", "moved, warm, low",
     f"Close-up of {MAT} {YARD}, {MR}, moved, his eyes shine", "LEFT")),
 ("c11", 6, talk("c11", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, his smile gone, pale and nervous, he takes the sunglasses off his head", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Mateo", one(f"Close-up of {MAT} {YARD}, {MR}, cold and serious, he looks at his employee", "RIGHT"), "cold, serious, slow")),
 ("c13", 6, talk("c13", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, nervous, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c14", D8("c14"), talk("c14", "Mateo", one(f"Close-up of {MAT} {YARD}, {MR}, he points slowly at the pecans on the ground, cold and final", "RIGHT"), "cold, final, slow")),
 ("r5", 6, f"Medium shot of {ULI} {YARD}, kneeling on the dry dirt, he picks up pecans one by one and puts them back in the burlap sack, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in an olive bomber jacket')}. No dialogue."),
 ("c15", D8("c15"), talk("c15", "Ulises", one(f"Close-up of {ULI} {YARD}, kneeling, a pecan in his hand, a bitter smile, his voice low", "LEFT"), "bitter, low, slow")),
 ("c16", 6, S("c16", "Mateo", f"Close-up of {MAT} {YARD0}, {MR}, confused, he turns to his father", ANA_B, "LEFT", "confused, worried",
     f"Close-up of {MAT} {YARD}, {MR}, confused", "LEFT")),
 ("c17", D8("c17"), (talk("c17", "Anacleto", two(f"{ANA} on the LEFT and {MAT} on the RIGHT, in profile facing each other under the pecan trees {YARD0}, framed from the waist up; "
     f"Anacleto, ashamed, speaks low, slightly closer to the camera and in sharper focus") + " " + MOUTH("Anacleto", "Mateo"), "ashamed, low, slow"),
   talk("c17", "Anacleto", one(f"Close-up of {ANA} {YARD}, {AL}, ashamed, low", "RIGHT"), "ashamed, low, slow"))),
 ("c18", 6, talk("c18", "Refugio", one(f"Close-up of {REF} {YARD}, {FL}, stunned, her eyes fill with tears of anger, she takes off her glasses", "RIGHT"), "stunned, hurt")),
 # CTA con carisma (después del BLACK): Anacleto solo, a cámara
 ("c19", 10, talk("c19", "Anacleto", f"Close-up from the chest up of {ANA} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Recójala usted, viejo.", "Recójala usted, don."), ("A ver si todavía se puede agachar.", "Usted sabe cómo."), ("Pregúntele a su papá por qué lo odio.", "Pregúntele a su papá quién soy."),
        ("tips over", "moves"), ("with shaking hands", "slowly"), ("her eyes fill with tears of anger", "her eyes shine"), ("with contempt", "coldly"), ("contemptuous", "cool"),
        ("humiliated", "quiet"), ("stunned", "surprised"), ("bitter", "serious"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden autumn afternoon in a pecan orchard in Coahuila, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, pecan orchard with burlap sacks and an adobe farmhouse in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ANACLETO_DAVILA}", "a thin elderly Mexican man with white stubble, a beige straw hat and a faded denim shirt"),
         ("@{REFUGIO_DAVILA}", "a plump elderly Mexican woman with short grey permed hair, a blue cardigan and a floral dress"),
         ("@{ULISES_GARZA}", "a tall Mexican man in his thirties with a shaved head, a black beard and an olive-green bomber jacket"),
         ("@{MATEO_DAVILA}", "a Mexican man around forty with grey temples and a charcoal-grey suit with an open white shirt"),
         (" @{LOC_NOGALERA}", "")]
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
