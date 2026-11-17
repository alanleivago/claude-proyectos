"""Genera los clips de jaiba-lagunamadre PARTE 1 (La Jaiba de la Laguna Madre, MEXI STORIES, cuenta @mexitve) con Omni Flash por el Flow MCP (CLI), uno por uno.
Variante transformada de capos de @atriumstories_ (humillación + plazo -> llega la figura de poder -> plazo invertido -> giro familiar): en el muelle de jaiberos de la Laguna Madre, Tamaulipas,
Brandon (35) tira las jaibas de Damiana (28) y le da plazo "antes de que regresen las lanchas"; su padre Odilón (70) hace una llamada: llega Belisario (63), al que salvó del agua hace veinte años,
y resulta ser tío de Brandon. Giro: la lancha que dejó a Belisario en el agua era del papá de Brandon, su propio hermano.
Copia del clips.py de rebozo-santamaria (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
# Geografía fija (muelle de jaiberos de la Laguna Madre, Tamaulipas): Damiana a la IZQUIERDA en su puesto de jaibas; Odilón a la IZQUIERDA, a la izquierda de su hija, junto a las redes;
# Brandon a la DERECHA recargado en el puesto; Belisario entra desde r4 a la DERECHA, a la entrada del muelle.
YARD0 = ("on a weathered wooden fishing dock on the Laguna Madre, Tamaulipas @{LOC_MUELLEJAIBA} in the late afternoon: wooden stalls with crates of live blue crabs and white coolers, "
         "fishing nets piled up, small fiberglass boats tied along the dock, the calm lagoon behind, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CRATE = "a wooden crate of live blue crabs"
NET = "an old green fishing net"
PHONE = "an old small flip phone"
DAM = ("@{DAMIANA_CAVAZOS} (28-year-old Mexican woman, tanned brown skin, long wavy black hair in a low ponytail, a faded coral t-shirt, a dark-green waterproof apron, "
       "rolled-up jeans, white rubber boots)")
ODI = ("@{ODILON_CAVAZOS} (70-year-old Mexican fisherman, thin and wiry, very dark sun-weathered wrinkled skin, short white hair, white stubble, "
       "a faded light-blue long-sleeve fishing shirt, rolled-up khaki trousers, old rubber sandals)")
BRA = ("@{BRANDON_ANAYA} (35-year-old Mexican man, light skin, a bleached-blond buzz cut, a thin blond beard, mirrored sunglasses on his head, a tight white t-shirt, "
       "a thick gold chain, ripped jeans, white sneakers)")
BEL = ("@{BELISARIO_ANAYA} (63-year-old Mexican man, heavy-set, light brown skin, a neat grey beard, a cream straw cowboy hat, a white guayabera, a gold watch, "
       "cream trousers, brown boots)")
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

# Bordes: Brandon o Belisario le hablan a Damiana/Odilón -> espalda de ella/él LEFT; Damiana u Odilón le hablan a Brandon/Belisario -> espalda de él RIGHT.
DAM_B = "@{DAMIANA_CAVAZOS} seen from behind (long wavy black hair in a low ponytail, faded coral t-shirt, the straps of a dark-green apron)"
ODI_B = "@{ODILON_CAVAZOS} seen from behind (short white hair, faded light-blue long-sleeve shirt, thin)"
BRA_B = "@{BRANDON_ANAYA} seen from behind (bleached-blond buzz cut, tight white t-shirt, the back of a thick gold chain on his neck)"
BEL_B = "@{BELISARIO_ANAYA} seen from behind (cream straw cowboy hat, white guayabera, heavy-set)"
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

DL = f"standing on the LEFT behind her wooden stall with {CRATE}"           # Damiana
OL = f"standing on the LEFT beside {NET}"                                   # Odilón
BR = "standing on the RIGHT, leaning on the wooden stall"                   # Brandon
ER = "standing on the RIGHT at the entrance of the wooden dock"             # Belisario

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Brandon YA hablando, recargado en el puesto; Damiana de espaldas (LEFT). Plazo: antes de que regresen las lanchas (c03).
 ("c01", 6, S("c01", "Brandon", f"Medium close-up of {BRA} {YARD0}, {BR}, talking from the very first frame, arrogant, he taps the crate of crabs with two fingers", DAM_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {BRA} {YARD}, {BR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Damiana", f"Close-up of {DAM} {YARD0}, {DL}, firm and proud, she raises her chin", BRA_B, "RIGHT", "firm, proud",
     f"Close-up of {DAM} {YARD}, {DL}, firm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, a cocky smile, he looks out at the lagoon and back", "LEFT"), "cocky, mocking, calm")),
 ("r1", 6, f"Medium shot of {ODI} {YARD}, {OL}, already in place sitting on an upturned crate mending the net, he stops and slowly stands up, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a light-blue shirt')}. Slow push-in. No dialogue."),
 ("c04", D8("c04"), S("c04", "Odilón", f"Close-up of {ODI} {YARD0}, {OL}, calm and firm, his voice low", BRA_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {ODI} {YARD}, {OL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Brandon", f"Close-up of {BRA} {YARD0}, {BR}, he laughs once with contempt", ODI_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {BRA} {YARD}, {BR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a white sneaker slowly pushes {CRATE} off the edge of the stall and the blue crabs spill across the wet wooden planks; only the shoe, the crate and the crabs, no face. No dialogue."),
 ("c06", 6, S("c06", "Damiana", f"Close-up of {DAM} {YARD0}, {DL}, indignant, her eyes shine, she points down at the planks", BRA_B, "RIGHT", "indignant, hurt",
     f"Close-up of {DAM} {YARD}, {DL}, indignant, her eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, laughing, he spreads his arms", "LEFT"), "mocking, cruel")),
 ("r2", 6, one(f"Close-up of {ODI} {YARD}, {OL}, in silence, his jaw tight, his eyes shine, he looks down at the spilled crabs", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), talk("c08", "Odilón", one(f"Close-up of {ODI} {YARD}, {OL}, quiet and serious, a memory in his eyes", "RIGHT"), "quiet, serious, slow")),
 ("c09", 6, S("c09", "Brandon", f"Close-up of {BRA} {YARD0}, {BR}, mocking, he shakes his head", ODI_B, "LEFT", "mocking, amused",
     f"Close-up of {BRA} {YARD}, {BR}, mocking", "LEFT")),
 ("r3", 6, f"Medium shot of {ODI} {YARD}, {OL}, he takes {PHONE} out of his shirt pocket, opens it and slowly presses a number with his thumb, calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Odilón", one(f"Close-up of {ODI} {YARD}, {OL}, holding {PHONE} to his ear, calm and serious", "RIGHT"), "calm, serious, low")),
 ("i02", 6, "Wide shot of three black pickup trucks driving slowly in a line along a dirt road beside the calm Laguna Madre, Tamaulipas, at sunset, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r4", 6, f"Medium shot of {BEL} {YARD}, {ER}, already standing in place, a black pickup truck parked behind him, he slowly takes off dark aviator sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cowboy hat')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Belisario", f"Close-up of {BEL} {YARD0}, {ER}, respectful and moved, he touches the brim of his hat", ODI_B, "LEFT", "respectful, warm, moved",
     f"Close-up of {BEL} {YARD}, {ER}, respectful and moved, he touches the brim of his hat", "LEFT")),
 ("c12", 6, S("c12", "Odilón", f"Close-up of {ODI} {YARD0}, {OL}, humble and firm", BEL_B, "RIGHT", "humble, firm",
     f"Close-up of {ODI} {YARD}, {OL}, humble and firm", "RIGHT")),
 ("c13", 6, talk("c13", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, his smile gone, pale and surprised", "RIGHT"), "surprised, nervous")),
 ("c14", D8("c14"), talk("c14", "Belisario", one(f"Close-up of {BEL} {YARD}, {ER}, cold and serious, he looks at his nephew", "LEFT"), "cold, serious, slow")),
 ("c15", 6, talk("c15", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, nervous, a forced smile, he lowers his sunglasses", "RIGHT"), "nervous, pleading")),
 ("c16", 6, talk("c16", "Belisario", one(f"Close-up of {BEL} {YARD}, {ER}, firm and calm, disappointed", "LEFT"), "firm, calm, disappointed")),
 ("c17", D8("c17"), talk("c17", "Belisario", one(f"Close-up of {BEL} {YARD}, {ER}, he gestures slowly toward the crabs on the planks, cold and final", "LEFT"), "cold, final, slow")),
 ("r5", 6, f"Medium shot of {BRA} {YARD}, kneeling on the wet wooden planks, he picks up blue crabs one by one and puts them back into the wooden crate, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('blond man')}. No dialogue."),
 ("c18", 6, S("c18", "Damiana", f"Close-up of {DAM} {YARD0}, {DL}, calm and dignified", BEL_B, "RIGHT", "calm, dignified, soft",
     f"Close-up of {DAM} {YARD}, {DL}, calm and dignified", "RIGHT")),
 ("c19", D8("c19"), (talk("c19", "Belisario", two(f"{DAM} on the LEFT and {BEL} on the RIGHT, in profile facing each other beside the stall {YARD0}, framed from the waist up; "
     f"Belisario, kind and firm, nods to her, slightly closer to the camera and in sharper focus") + " " + MOUTH("Belisario", "Damiana"), "kind, firm, warm"),
   talk("c19", "Belisario", one(f"Close-up of {BEL} {YARD}, {ER}, kind and firm", "LEFT"), "kind, firm, warm"))),
 ("c20", 6, talk("c20", "Brandon", one(f"Close-up of {BRA} {YARD}, kneeling on the wet planks, a crab in his hand, resentful, his voice low", "RIGHT"), "resentful, low")),
 ("c21", D8("c21"), (talk("c21", "Odilón", two(f"{ODI} on the LEFT and {BEL} on the RIGHT, in profile facing each other on the dock {YARD0}, framed from the waist up; "
     f"Odilón steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Odilón", "Belisario"), "low, serious, confessing"),
   talk("c21", "Odilón", one(f"Close-up of {ODI} {YARD}, {OL}, low and serious, confessing", "RIGHT"), "low, serious, confessing"))),
 ("c22", 6, talk("c22", "Belisario", one(f"Close-up of {BEL} {YARD}, {ER}, stunned, his face darkens slowly", "LEFT"), "stunned, low, dark")),
 # CTA con carisma (después del BLACK): Belisario solo, a cámara
 ("c23", 10, talk("c23", "Belisario", f"Close-up from the chest up of {BEL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his cowboy hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Recógelas tú, de rodillas.", "Recógelas tú."), ("Una por una, de rodillas, como se lo pediste a ella.", "Una por una, como se lo pediste a ella."),
        ("Nunca te enseñé a humillar.", "Nunca te enseñé a tratar así a la gente."), ("¿Y quién era, un pescado?", "¿Y quién era?"),
        ("La lancha que lo dejó en el agua esa noche era del papá de este muchacho.", "Esa noche, la lancha que se fue sin usted era del papá de este muchacho."),
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
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light on a wooden fishing dock on the Laguna Madre, Tamaulipas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic wooden fishing dock with crates of blue crabs by a calm lagoon in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{DAMIANA_CAVAZOS}", "a tanned Mexican woman in her twenties with a long wavy black ponytail, a faded coral t-shirt and a dark-green apron"),
         ("@{ODILON_CAVAZOS}", "a thin elderly Mexican fisherman with short white hair, white stubble and a faded light-blue long-sleeve shirt"),
         ("@{BRANDON_ANAYA}", "a light-skinned Mexican man in his thirties with a bleached-blond buzz cut, a tight white t-shirt and a gold chain"),
         ("@{BELISARIO_ANAYA}", "a heavy-set Mexican man in his sixties with a neat grey beard, a cream straw cowboy hat and a white guayabera"),
         (" @{LOC_MUELLEJAIBA}", "")]
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
