"""Genera los clips de vainilla-papantla PARTE 1 (La Vainilla de Papantla, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado del modelo de Atrium "Veinte años a su lado… y lo vendieron" (fuentes/atrium-vista/videos/7704056500502793502_analisis.md), sin copiarlo:
en un beneficio de vainilla de Papantla, Veracruz, llegan las camionetas de Fermín (62), rival de Tuxpan; el patrón Severiano (66) acusa a su hombre de confianza Chava (42).
Fermín da plazo "antes de que se seque la vainilla". Giro: la que le abrió la puerta fue su esposa Inés (58), y su hija Ximena es hija de Fermín. Sin federales, sin armas, sin dinero.
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
# Geografía fija (beneficio de vainilla): Severiano SIEMPRE a la IZQUIERDA (junto a su mesa de vainas); Chava, Inés y Fermín a la DERECHA (Fermín en el patio de tierra, junto a su camioneta).
YARD0 = ("in an open-sided vanilla curing house in Papantla, Veracruz @{LOC_BENEFICIO} in the humid golden afternoon: long wooden tables with dark-brown vanilla pods drying on woven palm mats, "
         "a red tiled roof on thick wooden posts, a dirt yard and lush green tropical plants beyond; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PODS = "a bundle of dark vanilla pods"
SEV = ("@{SEVERIANO_OLARTE} (66-year-old Mexican man, heavy-set, dark-brown skin, short white hair, a thick white mustache, a white long-sleeve linen shirt, a dark-brown leather vest)")
CHA = ("@{CHAVA_ROSAS} (42-year-old Mexican man, strong, brown skin, curly black hair, a short black beard, a light-grey work shirt with rolled-up sleeves, a red bandana around his neck)")
INE = ("@{INES_OLARTE} (58-year-old Mexican woman, brown skin, grey hair in a braided crown, gold earrings, a white embroidered blouse with a white lace cape over the shoulders)")
FER = ("@{FERMIN_ALDANA} (62-year-old Mexican man, tall and thin, light skin, dyed black slicked-back hair, a thin black mustache, a black western shirt with silver embroidery, "
       "a white straw cowboy hat)")
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

# Bordes: Severiano habla -> espalda del otro RIGHT; los demás le hablan a Severiano -> espalda de él LEFT.
SEV_B = "@{SEVERIANO_OLARTE} seen from behind (short white hair, dark-brown leather vest over a white linen shirt, heavy-set)"
CHA_B = "@{CHAVA_ROSAS} seen from behind (curly black hair, light-grey work shirt, a red bandana knot at the back of the neck)"
INE_B = "@{INES_OLARTE} seen from behind (grey hair in a braided crown, white lace cape over the shoulders)"
FER_B = "@{FERMIN_ALDANA} seen from behind (white straw cowboy hat, black western shirt, tall and thin)"
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

SL = "standing on the LEFT beside a long wooden table of drying vanilla pods"     # Severiano
CR = "standing on the RIGHT under the tiled roof"                                 # Chava
IR = "standing on the RIGHT in the doorway to the house"                          # Inés
FR = "standing on the RIGHT in the dirt yard, a dark pickup truck behind him"     # Fermín

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Chava YA hablando, recién llegado y agitado; Severiano de espaldas (LEFT) en su mesa de vainas.
 ("c01", 6, S("c01", "Chava", f"Medium close-up of {CHA} {YARD0}, {CR}, talking from the very first frame, out of breath and urgent, he has just arrived", SEV_B, "LEFT", "urgent, worried, quick",
     f"Medium close-up of {CHA} {YARD}, {CR}, talking from the very first frame, urgent", "LEFT")),
 ("c02", D8("c02"), S("c02", "Severiano", f"Close-up of {SEV} {YARD0}, {SL}, holding {PODS}, he looks up slowly, serious", CHA_B, "RIGHT", "serious, suspicious, low",
     f"Close-up of {SEV} {YARD}, {SL}, holding {PODS}, serious", "RIGHT")),
 ("i01", 6, "Wide shot of three dark pickup trucks driving slowly in a line along a muddy dirt road through lush green tropical vegetation and banana plants in Veracruz, golden afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("c03", D8("c03"), talk("c03", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, he puts the pods down, cold and suspicious", "RIGHT"), "cold, suspicious, slow")),
 ("c04", D8("c04"), S("c04", "Chava", f"Close-up of {CHA} {YARD0}, {CR}, hurt, one hand on his chest", SEV_B, "LEFT", "hurt, sincere, firm",
     f"Close-up of {CHA} {YARD}, {CR}, hurt, one hand on his chest", "LEFT")),
 ("c05", D8("c05"), S("c05", "Severiano", f"Close-up of {SEV} {YARD0}, {SL}, he steps closer, his voice low and hard", CHA_B, "RIGHT", "low, hard, serious",
     f"Close-up of {SEV} {YARD}, {SL}, his voice low and hard", "RIGHT")),
 ("r1", 6, f"Medium shot of {INE} {YARD}, {IR}, already in place, she stops in the doorway, worried, one hand on the door frame, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a white lace cape')}. Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Inés", one(f"Close-up of {INE} {YARD}, {IR}, worried", "LEFT"), "worried, soft, quick")),
 ("c07", 6, talk("c07", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, firm, without looking away", "RIGHT"), "firm, cold")),
 ("r2", 6, f"Medium shot of {FER} {YARD}, {FR}, already standing in place, he slowly takes off dark sunglasses and smiles, calm and confident, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white cowboy hat')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Fermín", f"Close-up of {FER} {YARD0}, {FR}, a confident smile, he touches the brim of his hat", SEV_B, "LEFT", "confident, ironic, calm",
     f"Close-up of {FER} {YARD}, {FR}, a confident smile", "LEFT")),
 ("c09", 6, S("c09", "Severiano", f"Close-up of {SEV} {YARD0}, standing on the LEFT at the edge of the curing house, cold and firm", FER_B, "RIGHT", "cold, firm",
     f"Close-up of {SEV} {YARD}, standing on the LEFT at the edge of the curing house, cold and firm", "RIGHT")),
 ("c10", D8("c10"), talk("c10", "Fermín", one(f"Close-up of {FER} {YARD}, {FR}, calm and sure, he gestures toward the drying pods", "LEFT"), "calm, sure, slow")),
 ("c11", 6, talk("c11", "Chava", one(f"Close-up of {CHA} {YARD}, {CR}, he steps forward, protective and firm", "RIGHT"), "protective, firm")),
 ("c12", 6, talk("c12", "Fermín", one(f"Close-up of {FER} {YARD}, {FR}, he laughs once, amused", "LEFT"), "amused, mocking")),
 ("r3", 6, one(f"Close-up of {SEV} {YARD}, {SL}, in silence, he turns his eyes to his loyal man, a flash of regret on his face", "RIGHT") + " Slow push-in. No dialogue."),
 ("c13", 6, S("c13", "Fermín", f"Close-up of {FER} {YARD0}, {FR}, he lowers his voice, enjoying the moment", SEV_B, "LEFT", "sly, low, slow",
     f"Close-up of {FER} {YARD}, {FR}, he lowers his voice", "LEFT")),
 ("c14", D8("c14"), talk("c14", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, surprised, thinking fast", "RIGHT"), "surprised, low")),
 ("r4", 6, one(f"Close-up of {INE} {YARD}, {IR}, in silence, she slowly lowers her eyes and presses her lips together", "LEFT") + " Slow push-in. No dialogue."),
 ("c15", 6, (talk("c15", "Severiano", two(f"{SEV} on the LEFT and {CHA} on the RIGHT, in profile facing each other under the tiled roof {YARD0}, framed from the waist up; "
     f"Severiano puts one hand on Chava's shoulder, sincere, slightly closer to the camera and in sharper focus") + " " + MOUTH("Severiano", "Chava"), "sincere, low, humble"),
   talk("c15", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, sincere and humble", "RIGHT"), "sincere, low, humble"))),
 ("c16", 6, S("c16", "Chava", f"Close-up of {CHA} {YARD0}, {CR}, a short nod, serious", SEV_B, "LEFT", "serious, loyal",
     f"Close-up of {CHA} {YARD}, {CR}, a short nod", "LEFT")),
 ("c17", 6, S("c17", "Severiano", f"Close-up of {SEV} {YARD0}, {SL}, he turns to his wife, his voice breaking", INE_B, "RIGHT", "hurt, low, slow",
     f"Close-up of {SEV} {YARD}, {SL}, his voice breaking", "RIGHT")),
 ("c18", D8("c18"), S("c18", "Inés", f"Close-up of {INE} {YARD0}, {IR}, her eyes shine, defiant, she raises her chin", SEV_B, "LEFT", "defiant, tired, firm",
     f"Close-up of {INE} {YARD}, {IR}, her eyes shine, defiant", "LEFT")),
 ("c19", 6, talk("c19", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, broken, his eyes shine", "RIGHT"), "broken, low")),
 ("c20", 6, talk("c20", "Inés", one(f"Close-up of {INE} {YARD}, {IR}, cold and calm, a tear on her cheek", "LEFT"), "cold, calm, slow")),
 ("c21", 6, (talk("c21", "Fermín", f"Medium wide group shot {YARD0}: {SEV} on the LEFT under the tiled roof, {CHA} and {INE} in the middle, {FER} on the RIGHT in the dirt yard; "
     f"Fermín, with a victorious smile, speaks, closest to the camera and in sharp focus; only these four people, no extras. Only Fermín speaks: his lips move clearly; the other three stay silent with mouths closed.", "victorious, calm"),
   talk("c21", "Fermín", one(f"Close-up of {FER} {YARD}, {FR}, a victorious smile", "LEFT"), "victorious, calm"))),
 ("r5", 6, one(f"Close-up of {SEV} {YARD}, {SL}, in silence, stunned, his face pale, he slowly closes his eyes", "RIGHT") + " Slow push-in. No dialogue."),
 ("c22", 6, talk("c22", "Chava", one(f"Close-up of {CHA} {YARD}, {CR}, loyal and firm, looking at his patron", "LEFT"), "loyal, firm, low")),
 # CTA con carisma (después del BLACK): Severiano solo, a cámara
 ("c23", 10, talk("c23", "Severiano", f"Close-up from the chest up of {SEV} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small bitter half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Porque si me mientes, aquí se acaba todo entre tú y yo.", "Porque si me mientes, ya no hay nada entre tú y yo."),
        ("Primero tendría que pasar por mí, don Fermín.", "Primero hable conmigo, don Fermín."), ("Si él ya te tiene por traidor.", "Si él ya ni te cree."),
        ("Y tu gente se viene conmigo.", "Y tu gente trabaja para mí."), ("his voice low and hard", "his voice low"), ("enjoying the moment", "calm"),
        ("stunned", "surprised"), ("his face pale", "quiet"), ("victorious", "confident"), ("defiant", "firm"),
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
          "Vertical scene from a Mexican TV drama, realistic, humid golden afternoon in a vanilla curing house in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic open-sided curing house with drying vanilla pods in tropical Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERIANO_OLARTE}", "a heavy-set elderly Mexican man with short white hair, a thick white mustache, a white linen shirt and a brown leather vest"),
         ("@{CHAVA_ROSAS}", "a strong Mexican man in his forties with curly black hair, a short beard, a grey work shirt and a red bandana"),
         ("@{INES_OLARTE}", "a Mexican woman in her late fifties with grey braided hair and a white embroidered blouse with a lace cape"),
         ("@{FERMIN_ALDANA}", "a tall thin Mexican man in his sixties with a thin mustache, a black embroidered western shirt and a white straw cowboy hat"),
         (" @{LOC_BENEFICIO}", "")]
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
