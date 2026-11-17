"""Genera los clips de lucero-parral PARTE 1 (El Caballo de Parral, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #22 "El compadre" [CAPO] (traición familiar), cierre tipo 7 (objeto que delata): en los corrales de la feria ganadera de Parral, el ganadero don Rufino (62) reconoce a su
caballo Lucero con el fierro de su rival Ismael (55). Ismael presume que se lo vendió "alguien que come en su mesa cada domingo"; su hija Ximena (34) nombra al compadre Anselmo.
En el establo de Ismael cuelga el sombrero negro que Rufino le regaló a su compadre el día que nació Lucero.
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
# Geografía fija (corrales): Rufino y Ximena a la IZQUIERDA; Ismael a la DERECHA junto al caballo amarrado a la cerca.
YARD0 = ("at the livestock fair corrals in Parral, Chihuahua @{LOC_FERIAPARRAL} in the afternoon: weathered wooden corral fences, wooden horse stalls under a tin roof, hay bales, "
         "a dusty ground, a chestnut stallion with a white blaze on its forehead tied at the fence, dry mountains far away, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
RUF = ("@{RUFINO_ALCANTARA} (62-year-old Mexican rancher, deeply tanned skin, a thick white mustache, a beige straw cowboy hat, a light-blue denim western shirt, a brown leather vest)")
ISM = ("@{ISMAEL_QUINONES} (55-year-old Mexican rancher, light skin, a neat black goatee, a white felt cowboy hat, a burgundy western shirt with embroidered yoke, a large silver belt buckle)")
VAL = ("@{XIMENA_ALCANTARA} (34-year-old Mexican woman, light-brown skin, long brown hair in a low ponytail, a cream western shirt, a denim jacket)")
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

RUF_B = "@{RUFINO_ALCANTARA} seen from behind (beige straw cowboy hat, brown leather vest over a light-blue shirt)"
ISM_B = "@{ISMAEL_QUINONES} seen from behind (white felt cowboy hat, burgundy western shirt)"
VAL_B = "@{XIMENA_ALCANTARA} seen from behind (long brown hair in a low ponytail, denim jacket)"
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

RL = "standing on the LEFT by the corral fence"
VL = "standing on the LEFT beside her father"
IR = "standing on the RIGHT next to the chestnut stallion"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ismael YA hablando junto al caballo, Rufino de espaldas en el borde.
 ("c01", 6, S("c01", "Ismael", f"Medium close-up of {ISM} {YARD0}, {IR}, talking from the very first frame, smug, one hand on the horse's neck", RUF_B, "LEFT", "smug, proud, mocking",
     f"Medium close-up of {ISM} {YARD}, {IR}, talking from the very first frame, smug", "LEFT")),
 ("c02", 6, S("c02", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, staring at the horse, moved and serious", ISM_B, "RIGHT", "serious, low, moved",
     f"Close-up of {RUF} {YARD}, {RL}, moved and serious", "RIGHT")),
 ("c03", 6, S("c03", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, a fake laugh, he pats the horse", RUF_B, "LEFT", "fake friendly, mocking",
     f"Close-up of {ISM} {YARD}, {IR}, a fake laugh", "LEFT")),
 ("c04", 6, S("c04", "Ximena", f"Close-up of {VAL} {YARD0}, {VL}, urgent and sure, she looks from the horse to her father", RUF_B, "RIGHT", "urgent, whispering, sure",
     f"Close-up of {VAL} {YARD}, {VL}, urgent and sure", "RIGHT")),
 ("c05", 6, S("c05", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, his voice hard now, eyes on the rival", ISM_B, "RIGHT", "hard, firm, contained",
     f"Close-up of {RUF} {YARD}, {RL}, hard and firm", "RIGHT")),
 ("c06", 6, S("c06", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, shrugging, relaxed, a sly smile", RUF_B, "LEFT", "relaxed, sly",
     f"Close-up of {ISM} {YARD}, {IR}, a sly smile", "LEFT")),
 ("r1", 6, one(f"Close-up of {RUF} {YARD}, {RL}, his jaw tightens under the white mustache, he breathes slowly, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 ("c07", 6, S("c07", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, he takes one step closer, low and dangerous", ISM_B, "RIGHT", "low, slow, demanding",
     f"Close-up of {RUF} {YARD}, {RL}, low and demanding", "RIGHT")),
 ("c08", 6, S("c08", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, he leans in, enjoying it, a cruel half smile", RUF_B, "LEFT", "enjoying it, slow, insinuating",
     f"Close-up of {ISM} {YARD}, {IR}, a half smile", "LEFT")),
 ("c09", 6, talk("c09", "Ximena", two(f"{VAL} on the LEFT and {RUF} on the RIGHT {YARD0}, framed from the waist up; she speaks to her father in a low worried voice, slightly closer to the camera "
     f"and in sharper focus, he turns his head to her slowly") + " " + MOUTH("Ximena", "Rufino"), "worried, low, hesitant")),
 ("c10", 6, S("c10", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, he raises one hand to stop her, hurt and stern", VAL_B, "RIGHT", "stern, hurt, firm",
     f"Close-up of {RUF} {YARD}, {RL}, stern and hurt", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, he tips his white hat, mocking, satisfied", RUF_B, "LEFT", "mocking, satisfied, slow",
     f"Close-up of {ISM} {YARD}, {IR}, mocking", "LEFT")),
 ("c12", 6, talk("c12", "Ximena", one(f"Close-up of {VAL} {YARD}, {VL}, she freezes, staring toward the horse stalls behind the rival, she slowly points with one finger", "RIGHT"), "shocked, whispering")),
 ("i01", 6, f"Close-up insert {YARD0}: inside a wooden horse stall, a black felt cowboy hat with a silver band and a brown hawk feather hangs alone on a nail; only the hat on the wooden wall, no hands, no people. No dialogue."),
 ("r2", 6, one(f"Medium shot of {RUF} {YARD}, standing by a wooden horse stall, he slowly takes a black felt cowboy hat with a silver band off a nail and holds it with both hands, staring at it, his eyes wet", "RIGHT", NODOUBLE("man in a straw cowboy hat")) + " Slow push-in. No dialogue."),
 ("c13", D8("c13"), talk("c13", "Rufino", one(f"Close-up of {RUF} {YARD}, standing by a wooden horse stall, holding a black felt cowboy hat with a silver band in both hands, his voice breaking, eyes wet", "RIGHT"), "broken, low, betrayed")),
 # CTA con carisma (después del BLACK): Rufino a cámara
 ("c14", 10, talk("c14", "Rufino", f"Close-up from the chest up of {RUF} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts bitter, makes a short pause, adjusts the brim of his straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small hard half smile. Nobody else around.",
     "charismatic, bitter, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("cruel", "proud"), ("mocking", "amused"), ("dangerous", "serious"), ("betrayed", "sad"), ("shocked", "surprised"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden afternoon light at the wooden horse corrals of a livestock fair in Chihuahua, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, ranch corrals and horse stalls in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{RUFINO_ALCANTARA}", "a tanned Mexican rancher in his sixties with a thick white mustache, a beige straw cowboy hat and a brown leather vest"),
         ("@{ISMAEL_QUINONES}", "a Mexican rancher in his fifties with a black goatee, a white felt cowboy hat and a burgundy western shirt"),
         ("@{XIMENA_ALCANTARA}", "a Mexican woman in her thirties with a long brown ponytail, a cream western shirt and a denim jacket"),
         (" @{LOC_FERIAPARRAL}", "")]
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
