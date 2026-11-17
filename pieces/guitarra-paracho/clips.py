"""Genera los clips de guitarra-paracho PARTE 1 (La Guitarra de Paracho, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos + estructura de la ref @alisorxomrb 7706249552289860896 (transformada): en la fábrica de guitarras de los Cuevas en Paracho, Michoacán, Ricardo (30), hijo del patrón, se burla de la
guitarra campeona del difunto padre de Efraín (24) y la tira al suelo; el patrón Gilberto (62) corre a Efraín; su madre Josefina (55) lo regaña; Efraín promete arreglarla y ganar el festival;
remate: Gilberto se ríe y apuesta su fábrica.
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
# Geografía fija. Fábrica: Efraín a la IZQUIERDA en su banco de trabajo; Ricardo y Gilberto a la DERECHA. Casa: Efraín IZQUIERDA, Josefina DERECHA.
YARD0 = ("inside a guitar factory workshop in Paracho, Michoacán @{LOC_FABRICAGUITARRAS} in the afternoon: rows of unfinished wooden guitars hanging from the ceiling, wooden workbenches "
         "with clamps and wood shavings, a big window to a cobblestone street, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOME0 = ("in a humble wooden house in Paracho, Michoacán @{LOC_CASAPARACHO} at dusk: a small kitchen-patio with a wooden table, a hanging lamp, clay pots, pine-covered hills behind, warm light; "
         "no readable text, no signs, no logos")
HOME = HOME0 + "; nobody else in the background, no extras, nobody besides the person described"
GUITAR = "an old handmade classical guitar with a dark rosewood body and a decorated sound hole"
EFR = ("@{EFRAIN_CHAVEZ} (24-year-old Mexican man, light-brown skin, curly black hair, light stubble, a grey t-shirt under a denim work apron with sawdust)")
RIC = ("@{RICARDO_CUEVAS} (30-year-old Mexican man, light skin, slicked-back black hair, a thin goatee, sunglasses on his head, a white linen shirt open at the chest, a gold chain)")
GIL = ("@{GILBERTO_CUEVAS} (62-year-old Mexican man, heavy-set, light-brown skin, grey hair, a thick grey mustache, a black felt cowboy hat, a burgundy western shirt)")
JOS = ("@{JOSEFINA_CHAVEZ} (55-year-old Mexican woman, brown skin, black hair with grey strands in a low bun, a dark-green shawl over a white blouse, a checked apron)")
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

# Bordes: Ricardo/Gilberto/Josefina le hablan a Efraín -> espalda de él LEFT; Efraín les habla -> espalda RIGHT.
EFR_B = "@{EFRAIN_CHAVEZ} seen from behind (curly black hair, grey t-shirt, denim apron straps)"
RIC_B = "@{RICARDO_CUEVAS} seen from behind (slicked-back black hair, white linen shirt)"
GIL_B = "@{GILBERTO_CUEVAS} seen from behind (black felt cowboy hat, burgundy western shirt, heavy-set)"
JOS_B = "@{JOSEFINA_CHAVEZ} seen from behind (black-and-grey hair in a low bun, dark-green shawl)"
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

EL = "standing on the LEFT at his wooden workbench"                                   # Efraín en la fábrica
RR = f"sitting on the RIGHT on the edge of a workbench, holding {GUITAR}"            # Ricardo con la guitarra
RS = "standing on the RIGHT by the workbench"                                         # Ricardo de pie
GR = "standing on the RIGHT in the middle of the workshop"                            # Gilberto
EH = "standing on the LEFT in the kitchen-patio, holding a broken guitar"             # Efraín en casa
JR = "standing on the RIGHT by the wooden table"                                      # Josefina

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ricardo YA hablando, sentado en el banco con la guitarra del padre en las manos, burlándose; Efraín de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Ricardo", f"Medium close-up of {RIC} {YARD0}, {RR}, talking from the very first frame, mocking, he strums the strings carelessly", EFR_B, "LEFT", "mocking, arrogant",
     f"Medium close-up of {RIC} {YARD}, {RR}, talking from the very first frame, mocking", "LEFT")),
 ("c02", D8("c02"), S("c02", "Efraín", f"Close-up of {EFR} {YARD0}, {EL}, worried and firm, he reaches out one hand", RIC_B, "RIGHT", "worried, firm",
     f"Close-up of {EFR} {YARD}, {EL}, worried and firm", "RIGHT")),
 ("c03", 6, talk("c03", "Ricardo", one(f"Close-up of {RIC} {YARD}, {RS}, standing up with the guitar held loosely in one hand, a cruel smile", "LEFT"), "mocking, cold")),
 ("i01", 6, f"Close-up insert {YARD0}: {GUITAR} slips from a man's hand and falls onto the wooden floor among wood shavings, the neck cracks; only the hand, the guitar and the floor, no face. No dialogue."),
 ("c04", 6, S("c04", "Efraín", f"Close-up of {EFR} {YARD0}, {EL}, his eyes fill with tears, hurt and angry but controlled", RIC_B, "RIGHT", "hurt, low, firm",
     f"Close-up of {EFR} {YARD}, {EL}, his eyes shine, hurt", "RIGHT")),
 ("r1", 6, f"Medium shot of {GIL} {YARD}, {GR}, already in place, he walks slowly in from the office, annoyed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black cowboy hat')}. Slow push-in. No dialogue."),
 ("c05", 6, talk("c05", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GR}, annoyed, bossy", "LEFT"), "annoyed, bossy")),
 ("c06", D8("c06"), talk("c06", "Ricardo", one(f"Close-up of {RIC} {YARD}, {RS}, he turns to his father, accusing, sly", "RIGHT"), "sly, accusing")),
 ("c07", D8("c07"), S("c07", "Gilberto", f"Close-up of {GIL} {YARD0}, {GR}, offended and proud", EFR_B, "LEFT", "offended, proud, mocking",
     f"Close-up of {GIL} {YARD}, {GR}, offended and proud", "LEFT")),
 ("c08", D8("c08"), S("c08", "Efraín", f"Close-up of {EFR} {YARD0}, {EL}, respectful but firm, his eyes shine", GIL_B, "RIGHT", "respectful, firm, emotional",
     f"Close-up of {EFR} {YARD}, {EL}, respectful but firm", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Gilberto", f"Close-up of {GIL} {YARD0}, {GR}, cold and final, he points at the door", EFR_B, "LEFT", "cold, final",
     f"Close-up of {GIL} {YARD}, {GR}, cold and final", "LEFT")),
 ("r2", 6, f"Medium shot of {EFR} {YARD}, he slowly kneels, picks up the cracked guitar from the floor and holds it against his chest with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('young man in a denim apron')}. Slow push-in. No dialogue."),
 ("i02", 6, f"Wide shot of a cobblestone street in Paracho, Michoacán at dusk with small guitar shops and wooden houses: {EFR} small in the frame, walking away alone carrying a cracked guitar; seen from far away, no other people, no readable text. No dialogue."),
 ("c10", 6, S("c10", "Josefina", f"Close-up of {JOS} {HOME0}, {JR}, worried, a hand on her chest", EFR_B, "LEFT", "worried, soft",
     f"Close-up of {JOS} {HOME}, {JR}, worried", "LEFT")),
 ("c11", D8("c11"), S("c11", "Efraín", f"Close-up of {EFR} {HOME0}, {EH}, ashamed and sad", JOS_B, "RIGHT", "sad, low",
     f"Close-up of {EFR} {HOME}, {EH}, ashamed and sad", "RIGHT")),
 ("c12", D8("c12"), talk("c12", "Josefina", one(f"Close-up of {JOS} {HOME}, {JR}, upset and scared, she raises her hands", "LEFT"), "upset, scared, scolding")),
 ("c13", D8("c13"), (talk("c13", "Efraín", two(f"{EFR} on the LEFT holding the cracked guitar and {JOS} on the RIGHT by the table, facing each other {HOME0}, framed from the waist up; "
     f"Efraín, determined, slightly closer to the camera and in sharper focus") + " " + MOUTH("Efraín", "Josefina"), "determined, brave"),
   talk("c13", "Efraín", one(f"Close-up of {EFR} {HOME}, {EH}, determined", "RIGHT"), "determined, brave"))),
 ("c14", 6, talk("c14", "Josefina", one(f"Close-up of {JOS} {HOME}, {JR}, worried, she makes the sign of the cross", "LEFT"), "worried, resigned")),
 ("r3", 6, f"Medium shot {HOME}: {EFR} at the wooden table at night under the hanging lamp, carefully gluing and clamping the cracked neck of the guitar, focused, the only person in the shot. Slow push-in. No dialogue."),
 ("c15", D8("c15"), talk("c15", "Efraín", f"Close-up of {EFR} at the wooden table at night under the hanging lamp {HOME}, holding the repaired guitar, speaking softly to it, a small determined smile; "
     f"the only person in the shot; {ONE}.", "tender, soft, determined")),
 ("c16", D8("c16"), talk("c16", "Ricardo", one(f"Close-up of {RIC} sitting at a wooden table in the factory office corner {YARD}, amused, gossiping", "RIGHT"), "amused, mocking")),
 ("c17", D8("c17"), talk("c17", "Gilberto", one(f"Close-up of {GIL} sitting at a wooden table in the factory office corner {YARD}, he laughs out loud and slaps the table, mocking", "LEFT"), "mocking, laughing")),
 # CTA con carisma (después del BLACK): Efraín solo, a cámara
 ("c18", 10, talk("c18", "Efraín", f"Close-up from the chest up of {EFR} {HOME}, alone, holding the repaired guitar, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, taps the guitar body softly, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small confident half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si tanto vale, que aguante el suelo.", "Si tanto vale, que lo demuestre."), ("Suena peor que una lata de chiles.", "Suena como lata."),
        ("the neck cracks", "it lies on the floor"), ("cracked", "damaged"), ("his eyes fill with tears, hurt and angry but controlled", "his eyes shine, sad"),
        ("a cruel smile", "a smile"), ("slaps the table", "leans back"), ("offended", "surprised"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm light in a guitar factory workshop in Paracho, Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic guitar workshop with unfinished guitars hanging, in a Mexican mountain town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EFRAIN_CHAVEZ}", "a young Mexican man in his twenties with curly black hair, a grey t-shirt and a denim work apron"),
         ("@{RICARDO_CUEVAS}", "a Mexican man around thirty with slicked-back hair, a thin goatee, a white linen shirt and a gold chain"),
         ("@{GILBERTO_CUEVAS}", "a heavy-set Mexican man in his sixties with a grey mustache, a black cowboy hat and a burgundy western shirt"),
         ("@{JOSEFINA_CHAVEZ}", "a Mexican woman in her fifties with grey-streaked hair in a bun, a green shawl and a checked apron"),
         (" @{LOC_FABRICAGUITARRAS}", ""), (" @{LOC_CASAPARACHO}", "")]
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
