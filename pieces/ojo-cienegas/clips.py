"""Genera los clips de ojo-cienegas PARTE 1 (El Ojo de Agua, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #51 "La cacica del Miedo" [CAPO] (Patronas y haciendas), cierre tipo 2 (documento leído, corte antes del dato): en el lindero de su hacienda nogalera en Cuatro Ciénegas,
la temida doña Tránsito (58) encara a Andrés (35), licenciado y nieto del vecino, que vino a medir. Su capataz Rosendo (54) lo reconoce. Andrés acusa que ella fue corriendo la cerca
y despliega el plano original que guardó su abuelo: "el ojo de agua queda dentro de la tierra de…" (corte).
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
# Geografía fija (lindero): Tránsito a la DERECHA junto a los nogales; Rosendo a la DERECHA un paso detrás de ella; Andrés a la IZQUIERDA junto a la cerca de alambre y la mesa de madera.
LIN0 = ("at the boundary of a pecan hacienda in Cuatro Cienegas, Coahuila @{LOC_LINDEROCIENEGAS} in the dry mid-afternoon: an old barbed wire fence with crooked wooden posts, tall pecan trees, desert scrub and pale mountains, "
        "a clear turquoise spring pool in the distance; no readable text, no signs, no logos")
LIN = LIN0 + "; nobody else in the background, no extras, nobody besides the person described"
TRA = ("@{TRANSITO_ELIZONDO} (58-year-old Mexican woman, sun-tanned skin, short silver-streaked black hair swept back, sharp dark eyes, a black felt cowboy hat, a tan suede ranch jacket over a black blouse)")
AND = ("@{ANDRES_VILLARREAL} (35-year-old Mexican man, fair skin, short neat brown hair, light stubble, rimless glasses, a navy blazer over a white shirt without tie)")
ROS = ("@{ROSENDO_AYALA} (54-year-old Mexican man, dark weathered skin, grey stubble, a straw cowboy hat, a red bandana around his neck, a faded beige work shirt)")
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

TRA_B = "@{TRANSITO_ELIZONDO} seen from behind (black felt cowboy hat, tan suede ranch jacket)"
AND_B = "@{ANDRES_VILLARREAL} seen from behind (short neat brown hair, navy blazer)"
ROS_B = "@{ROSENDO_AYALA} seen from behind (straw cowboy hat, red bandana, beige work shirt)"
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

TR = "standing on the RIGHT under the pecan trees"
RR = "standing on the RIGHT a step behind the patrona, under the pecan trees"
AL = "standing on the LEFT by the barbed wire fence and a wooden table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Tránsito YA hablando, dura, Andrés de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Tránsito", f"Medium close-up of {TRA} {LIN0}, {TR}, talking from the very first frame, cold and dominant, she tips her hat brim up with one finger", AND_B, "LEFT", "cold, dominant, threatening",
     f"Medium close-up of {TRA} {LIN}, {TR}, talking from the very first frame, cold and dominant", "LEFT")),
 ("c02", 6, S("c02", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, calm and polite, adjusting his glasses, not intimidated", TRA_B, "RIGHT", "calm, polite, firm",
     f"Close-up of {AND} {LIN}, {AL}, calm, adjusting his glasses", "RIGHT")),
 ("c03", 6, S("c03", "Rosendo", f"Close-up of {ROS} {LIN0}, {RR}, leaning toward the patrona, talking low, worried", TRA_B, "LEFT", "low, worried, respectful",
     f"Close-up of {ROS} {LIN}, {RR}, talking low, worried", "LEFT")),
 ("c04", D8("c04"), S("c04", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, quiet and sincere, he rests one hand on a crooked fence post", TRA_B, "RIGHT", "quiet, sincere, firm",
     f"Close-up of {AND} {LIN}, {AL}, quiet and sincere, hand on a fence post", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, a dry contemptuous smile, looking the lawyer up and down", AND_B, "LEFT", "dry, scornful, proud",
     f"Close-up of {TRA} {LIN}, {TR}, dry smile", "LEFT")),
 ("c06", 6, S("c06", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, without looking away from the lawyer, she gives a curt order to her foreman beside her", ROS_B, "RIGHT", "curt, commanding, cold",
     f"Close-up of {TRA} {LIN}, {TR}, giving a curt order", "RIGHT")),
 ("r1", 6, one(f"Close-up of {ROS} {LIN}, {RR}, he hesitates, looks down at the wooden stakes in the ground by the fence, then at the patrona, uneasy, he does not move", "LEFT") + " No dialogue."),
 ("c07", D8("c07"), S("c07", "Rosendo", f"Close-up of {ROS} {LIN0}, {RR}, uneasy, holding his straw hat, speaking carefully to the patrona", TRA_B, "LEFT", "careful, uneasy, honest",
     f"Close-up of {ROS} {LIN}, {RR}, careful and uneasy", "LEFT")),
 ("c08", D8("c08"), S("c08", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, he points calmly at a crooked fence post, steady voice", TRA_B, "RIGHT", "steady, accusing, calm",
     f"Close-up of {AND} {LIN}, {AL}, pointing calmly at the fence", "RIGHT")),
 ("c09", 6, S("c09", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, she takes a slow step toward him, eyes hard, voice low", AND_B, "LEFT", "low, hard, warning",
     f"Close-up of {TRA} {LIN}, {TR}, eyes hard, voice low", "LEFT")),
 ("c10", 6, S("c10", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, he steps forward too, calm, face to face with her", TRA_B, "RIGHT", "calm, firm, brave",
     f"Close-up of {AND} {LIN}, {AL}, calm and brave", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, a cold proud smile, enjoying the memory", AND_B, "LEFT", "cold, proud, cutting",
     f"Close-up of {TRA} {LIN}, {TR}, cold proud smile", "LEFT")),
 ("c12", 6, S("c12", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, his jaw tightens, controlled anger, steady voice", TRA_B, "RIGHT", "controlled, accusing, steady",
     f"Close-up of {AND} {LIN}, {AL}, controlled anger", "RIGHT")),
 ("r2", 6, one(f"Close-up of {ROS} {LIN}, {RR}, he slowly turns his head toward the patrona, surprised, as if hearing this for the first time, silent", "LEFT") + " No dialogue."),
 ("c13", 6, S("c13", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, he holds up a rolled old yellowed paper, serious", TRA_B, "RIGHT", "serious, calm, meaningful",
     f"Close-up of {AND} {LIN}, {AL}, holding up a rolled old paper", "RIGHT")),
 ("r3", 6, one(f"Medium shot of {AND} {LIN}, {AL}, he unrolls a large old yellowed hand-drawn land map on the wooden table and holds its corners flat, the map facing away from the camera, no readable text", "RIGHT") + " No dialogue."),
 ("i01", 6, f"Close-up insert {LIN0}: a man's hands holding flat an old yellowed hand-drawn land map on a wooden table, with faded ink lines, a drawn spring pool and an old round red wax seal in the corner; no readable text, no letters, no numbers. No dialogue."),
 ("c14", 6, S("c14", "Rosendo", f"Close-up of {ROS} {LIN0}, {RR}, staring at the map, he takes off his straw hat slowly, uneasy", TRA_B, "LEFT", "uneasy, low, surprised",
     f"Close-up of {ROS} {LIN}, {RR}, staring, taking off his hat", "LEFT")),
 ("c15", 6, S("c15", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, arms crossed, defiant, but her eyes go to the map", AND_B, "LEFT", "defiant, dismissive, tense",
     f"Close-up of {TRA} {LIN}, {TR}, arms crossed, defiant", "LEFT")),
 ("c16", D8("c16"), S("c16", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, looking down at the map on the table and reading slowly, then lifting his eyes to her before the last word", TRA_B, "RIGHT", "slow, deliberate, quiet",
     f"Close-up of {AND} {LIN}, {AL}, reading slowly from the map", "RIGHT")),
 ("r4", 6, one(f"Close-up of {TRA} {LIN}, {TR}, frozen, her hard face slowly breaks, her lips part, her eyes fixed on the map, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Andrés a cámara
 ("c17", 10, talk("c17", "Andrés", f"Close-up from the chest up of {AND} {LIN}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, takes off his glasses and holds them in one hand, raises one eyebrow, gestures with the other open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("cold, dominant, threatening", "cold, dominant"), ("low, hard, warning", "low, serious"), ("dry, scornful, proud", "dry, proud"), ("threatening", "serious"), ("barbed wire", "wire"),
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
          "Vertical scene from a Mexican TV drama, realistic, dry afternoon light at the fence line of a pecan hacienda in the Coahuila desert, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, pecan trees and an old fence in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TRANSITO_ELIZONDO}", "a stern Mexican woman in her late fifties with short silver-streaked hair, a black felt cowboy hat and a tan suede ranch jacket"),
         ("@{ANDRES_VILLARREAL}", "a Mexican man in his mid thirties with neat brown hair, rimless glasses and a navy blazer"),
         ("@{ROSENDO_AYALA}", "a Mexican foreman in his fifties with grey stubble, a straw cowboy hat and a red bandana"),
         (" @{LOC_LINDEROCIENEGAS}", "")]
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
