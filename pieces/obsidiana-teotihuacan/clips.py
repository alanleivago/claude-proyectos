"""Genera los clips de obsidiana-teotihuacan PARTE 1 (La Obsidiana de Teotihuacán, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado, sin niños (humillación + plazo -> la llamada que el villano no cree -> llega la figura de poder -> plazo invertido -> giro familiar): frente a las pirámides de Teotihuacán,
Brandon (33) quiere el taller del tallador don Lauro (70) para una tienda de recuerdos, le rompe una máscara de obsidiana encargada por el museo y le da plazo "antes del equinoccio"; su hija
Paloma (29) lo defiende. Lauro llama a la doctora Ibarra (52), directora del museo: plazo invertido y permiso cancelado. Giro: la doctora es hija de la madre de Paloma, su media hermana.
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
# Geografía fija (taller abierto): Lauro y Paloma a la IZQUIERDA (repisas y banco de tallado); Brandon y la doctora a la DERECHA (del lado del patio).
YARD0 = ("in a small open-front obsidian carving workshop near the Pyramid of the Sun in Teotihuacán, State of Mexico @{LOC_TALLEROBSIDIANA} in the afternoon: wooden shelves with shiny black obsidian masks and figures, "
         "a carving bench with a grinding wheel, a dusty yard with nopal cacti, the great stone pyramid in the distance, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
MASK = "a polished black obsidian mask"
PHONE = "an old small flip phone"
LAU = ("@{LAURO_ZEMPOALTECA} (70-year-old Mexican man, thin, brown wrinkled skin, short grey hair, a grey mustache, round glasses on a cord, a beige work shirt, a dark canvas apron with stone dust)")
PAL = ("@{PALOMA_ZEMPOALTECA} (29-year-old Mexican woman, brown skin, long straight loose black hair, a white blouse under a dark-red cardigan)")
BRA = ("@{BRANDON_VILLASENOR} (33-year-old Mexican man, light skin, short bleached-blond hair, light stubble, a tight black polo shirt, a gold watch, white trousers)")
IBA = ("@{DRA_IBARRA} (52-year-old elegant Mexican woman, brown skin, black hair in a neat low bun, black-rimmed glasses, a navy-blue tailored blazer over a white blouse, a silver necklace)")
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

# Bordes: Brandon o la doctora le hablan a Lauro/Paloma -> espalda LEFT; Lauro o Paloma les hablan -> espalda RIGHT.
LAU_B = "@{LAURO_ZEMPOALTECA} seen from behind (short grey hair, beige work shirt, apron strings, thin)"
PAL_B = "@{PALOMA_ZEMPOALTECA} seen from behind (long straight loose black hair, dark-red cardigan)"
BRA_B = "@{BRANDON_VILLASENOR} seen from behind (short bleached-blond hair, tight black polo shirt)"
IBA_B = "@{DRA_IBARRA} seen from behind (black hair in a neat low bun, navy-blue blazer)"
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

LL = "standing on the LEFT at his carving bench"                         # Lauro
PL = "standing on the LEFT beside the shelves of obsidian pieces"        # Paloma
BR = "standing on the RIGHT at the open front of the workshop"           # Brandon
IR = "standing on the RIGHT in the dusty yard in front of the workshop"  # Doctora

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Brandon YA hablando en la entrada del taller; Lauro de espaldas (LEFT) en su banco.
 ("c01", D8("c01"), S("c01", "Brandon", f"Medium close-up of {BRA} {YARD0}, {BR}, talking from the very first frame, arrogant, he looks around the workshop with disdain", LAU_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {BRA} {YARD}, {BR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Lauro", f"Close-up of {LAU} {YARD0}, {LL}, calm and proud, stone dust on his hands", BRA_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {LAU} {YARD}, {LL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, a cocky smile, he picks up a small obsidian figure and looks at it with disdain", "LEFT"), "cocky, mocking")),
 ("r1", 6, f"Medium shot of {PAL} {YARD}, {PL}, already in place, she puts down a box and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a dark-red cardigan')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Paloma", f"Close-up of {PAL} {YARD0}, {PL}, firm and protective", BRA_B, "RIGHT", "firm, protective",
     f"Close-up of {PAL} {YARD}, {PL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Brandon", f"Close-up of {BRA} {YARD0}, {BR}, offended, he raises an eyebrow", PAL_B, "LEFT", "offended, cold",
     f"Close-up of {BRA} {YARD}, {BR}, offended", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold watch slowly knocks {MASK} off a wooden shelf and it lands on the dusty floor in pieces; only the hand, the shelf and the obsidian, no face. No dialogue."),
 ("c06", 6, S("c06", "Lauro", f"Close-up of {LAU} {YARD0}, {LL}, his eyes shine, he looks down at the broken mask, dignified", BRA_B, "RIGHT", "hurt, dignified",
     f"Close-up of {LAU} {YARD}, {LL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {LAU} {YARD}, he slowly kneels and gathers the black obsidian pieces into his apron, dignified, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a canvas apron')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Lauro", two(f"{LAU} on the LEFT holding obsidian pieces in his apron and {PAL} on the RIGHT, close together by the shelves {YARD0}, framed from the waist up; "
     f"Lauro speaks calmly to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lauro", "Paloma"), "calm, firm, low"),
   talk("c08", "Lauro", one(f"Close-up of {LAU} {YARD}, {LL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of an elegant dark car driving slowly along a dirt road with nopal cacti toward the Pyramid of the Sun in Teotihuacán, warm afternoon light, dust behind it; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {IBA} {YARD}, {IR}, already standing in place, she takes off her glasses and looks at the workshop, elegant and serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a navy blazer')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Ibarra", f"Close-up of {IBA} {YARD0}, {IR}, warm and respectful, a small smile", LAU_B, "LEFT", "warm, respectful",
     f"Close-up of {IBA} {YARD}, {IR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Ibarra", one(f"Close-up of {IBA} {YARD}, {IR}, cold and serious, she looks at Brandon", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Ibarra", one(f"Close-up of {IBA} {YARD}, {IR}, she points at the broken pieces, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {BRA} {YARD}, kneeling on the dusty floor in his white trousers, he picks up black obsidian pieces one by one, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black polo shirt')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Paloma", f"Close-up of {PAL} {YARD0}, {PL}, grateful, a small smile", IBA_B, "RIGHT", "grateful, warm",
     f"Close-up of {PAL} {YARD}, {PL}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Ibarra", f"Close-up of {IBA} {YARD0}, {IR}, her smile fades, serious, she glances at the old man", PAL_B, "LEFT", "serious, soft, slow",
     f"Close-up of {IBA} {YARD}, {IR}, serious", "LEFT")),
 ("c16", 6, talk("c16", "Paloma", one(f"Close-up of {PAL} {YARD}, {PL}, confused, she turns to her father", "RIGHT"), "confused, worried")),
 ("c17", D8("c17"), (talk("c17", "Lauro", two(f"{PAL} on the LEFT and {LAU} on the RIGHT, facing each other by the carving bench {YARD0}, framed from the waist up; "
     f"Lauro, his eyes shine, speaks low to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lauro", "Paloma"), "low, emotional, slow"),
   talk("c17", "Lauro", one(f"Close-up of {LAU} {YARD}, {LL}, low and emotional, his eyes shine", "LEFT"), "low, emotional, slow"))),
 # CTA con carisma (después del BLACK): Paloma sola, a cámara
 ("c18", 10, talk("c18", "Paloma", f"Close-up from the chest up of {PAL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, pushes her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small surprised half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Y ella qué va a hacer, curarle la tristeza?", "¿Y ella qué va a hacer?"), ("Y usted le rompe su máscara.", "Y usted maltrata su máscara."),
        ("knocks", "moves"), ("lands on the dusty floor in pieces", "rests on the dusty floor"), ("broken", "fallen"), ("humiliated", "quiet"), ("offended", "surprised"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in an obsidian carving workshop near the pyramids of Teotihuacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic stone carving workshop with black obsidian pieces and a pyramid far behind, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LAURO_ZEMPOALTECA}", "a thin elderly Mexican man with grey hair, a grey mustache, round glasses on a cord and a dusty canvas apron"),
         ("@{PALOMA_ZEMPOALTECA}", "a Mexican woman around thirty with long loose black hair and a dark-red cardigan"),
         ("@{BRANDON_VILLASENOR}", "a Mexican man in his thirties with short bleached-blond hair, a black polo shirt and white trousers"),
         ("@{DRA_IBARRA}", "an elegant Mexican woman in her fifties with a neat bun, black-rimmed glasses and a navy blazer"),
         (" @{LOC_TALLEROBSIDIANA}", "")]
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
