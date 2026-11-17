"""Genera los clips de junta-guadalajara PARTE 1 (La Junta de Guadalajara, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #26 "La secretaria que no olvidó" [CAPO], cierre tipo 1 (entra un personaje inesperado): en la sala de juntas de su casa tequilera, don Ernesto Valdivia (60) le pide café a la mujer
que entra, creyendo que es una asistente: es Lucía (40), la secretaria a la que humilló hace quince años, hoy socia mayoritaria del grupo con el que él quiere aliarse. Su hijo Mauricio (32) se burla.
Ernesto intenta arreglarlo; Lucía dice que su socia viene subiendo. Entra Beatriz (58), la esposa de Ernesto: "Vengo a firmar con mi socia."
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
# Geografía fija (sala de juntas): Ernesto sentado y Mauricio de pie a la DERECHA de la mesa; Lucía a la IZQUIERDA (luego en la cabecera izquierda); la puerta de vidrio a la IZQUIERDA.
YARD0 = ("in a modern boardroom on the top floor of a tequila company in Guadalajara, Jalisco @{LOC_JUNTAGUADALAJARA} in the morning: glass walls, a long dark wood conference table with leather chairs, "
         "a blue agave plant in a big clay pot, shelves with unlabeled tequila bottles, a wide window with the city view, soft light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
FOLDER = "a black leather document folder and a silver fountain pen"
ERN = ("@{ERNESTO_VALDIVIA} (60-year-old Mexican man, heavy-set, light skin, slicked-back grey hair, a grey goatee, a dark-navy pinstripe suit, a white shirt with no tie, a gold signet ring)")
LUC = ("@{LUCIA_MENDEZ} (40-year-old Mexican woman, light-brown skin, sleek straight black shoulder-length hair, small diamond earrings, a tailored ivory pantsuit over a black silk blouse)")
MAU = ("@{MAURICIO_VALDIVIA} (32-year-old Mexican man, fair skin, styled short black hair with a quiff, clean-shaven, a slim light-grey suit, a pink shirt open at the collar)")
BEA = ("@{BEATRIZ_VALDIVIA} (58-year-old Mexican woman, fair skin, short elegant light-brown bob, pearl earrings, a camel wool coat over a black turtleneck dress, a black handbag on her arm)")
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

ERN_B = "@{ERNESTO_VALDIVIA} seen from behind (slicked-back grey hair, dark-navy pinstripe suit, heavy-set)"
LUC_B = "@{LUCIA_MENDEZ} seen from behind (sleek straight black shoulder-length hair, ivory pantsuit)"
MAU_B = "@{MAURICIO_VALDIVIA} seen from behind (styled short black hair, light-grey suit)"
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

ER = "sitting on the RIGHT at the conference table, leaning back in a leather chair"
MR = "standing on the RIGHT behind his father's chair"
LL = "standing on the LEFT near the glass door"
LH = "sitting at the head of the conference table on the LEFT, very straight"
BL = "standing on the LEFT in the open glass doorway"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ernesto YA hablando sin levantar la vista de su celular; Lucía de espaldas (LEFT).
 ("c01", 6, S("c01", "Ernesto", f"Medium close-up of {ERN} {YARD0}, {ER}, talking from the very first frame without looking up from his cell phone, arrogant, he waves two fingers", LUC_B, "LEFT", "arrogant, bored, bossy",
     f"Medium close-up of {ERN} {YARD}, {ER}, talking from the very first frame without looking up from his phone, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Lucía", f"Close-up of {LUC} {YARD0}, {LL}, calm, a cold small smile", ERN_B, "RIGHT", "calm, cold, slow",
     f"Close-up of {LUC} {YARD}, {LL}, calm, a cold small smile", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Ernesto", one(f"Close-up of {ERN} {YARD}, {ER}, he finally looks up, surprised, then scoffs", "LEFT"), "surprised, scornful")),
 ("r1", 6, f"Medium shot of {MAU} {YARD}, {MR}, already in place, hands in his pockets, a mocking smirk, {gaze('LEFT')}; {ALONE}; {NODOUBLE('young man in a light-grey suit')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Mauricio", one(f"Close-up of {MAU} {YARD}, {MR}, mocking, he chuckles", "LEFT"), "mocking, cocky")),
 ("c05", 6, S("c05", "Lucía", f"Close-up of {LUC} {YARD0}, {LL}, calm and firm, she places {FOLDER} on the table", MAU_B, "RIGHT", "calm, firm",
     f"Close-up of {LUC} {YARD}, {LL}, calm and firm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: {FOLDER} lie on the dark wood conference table, the folder opens to show printed pages without readable text; only the folder and the pen, no hands, no people. No dialogue."),
 ("c06", D8("c06"), S("c06", "Ernesto", f"Close-up of {ERN} {YARD0}, {ER}, contemptuous, he points lazily at the door", LUC_B, "LEFT", "contemptuous, cruel",
     f"Close-up of {ERN} {YARD}, {ER}, contemptuous", "LEFT")),
 ("c07", 6, talk("c07", "Lucía", one(f"Close-up of {LUC} {YARD}, {LH}, she has just sat down at the head of the table, calm, powerful, a cold stare", "RIGHT"), "calm, powerful, slow")),
 ("r2", 6, one(f"Close-up of {ERN} {YARD}, {ER}, in silence, stunned, his cell phone slowly lowers, his smile disappears", "LEFT") + " Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Mauricio", one(f"Close-up of {MAU} {YARD}, {MR}, nervous now, he bends toward his father", "LEFT"), "nervous, whispering")),
 ("c09", 6, S("c09", "Ernesto", f"Close-up of {ERN} {YARD0}, {ER}, a big false smile, he spreads his hands", LUC_B, "LEFT", "falsely warm, nervous",
     f"Close-up of {ERN} {YARD}, {ER}, a big false smile", "LEFT")),
 ("c10", 6, S("c10", "Lucía", f"Close-up of {LUC} {YARD0}, {LH}, firm, her eyes shine with contained anger", ERN_B, "RIGHT", "firm, low, contained",
     f"Close-up of {LUC} {YARD}, {LH}, firm", "RIGHT")),
 ("c11", 6, talk("c11", "Ernesto", one(f"Close-up of {ERN} {YARD}, {ER}, he leans forward, trying to negotiate", "LEFT"), "nervous, persuasive")),
 ("c12", 6, S("c12", "Lucía", f"Close-up of {LUC} {YARD0}, {LH}, a small mysterious smile, she glances toward the glass door", ERN_B, "RIGHT", "calm, mysterious",
     f"Close-up of {LUC} {YARD}, {LH}, a small mysterious smile", "RIGHT")),
 ("r3", 6, f"Medium shot of {BEA} {YARD}, {BL}, already standing in place, elegant and serious, she slowly takes off dark sunglasses, {gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a camel coat')}. Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Ernesto", one(f"Close-up of {ERN} {YARD}, he stands up from his chair, pale, confused", "LEFT"), "confused, scared, low")),
 ("c14", 6, talk("c14", "Beatriz", one(f"Close-up of {BEA} {YARD}, {BL}, cold and hurt, chin up", "RIGHT"), "cold, hurt, firm")),
 # CTA con carisma (después del BLACK): Lucía sola, a cámara
 ("c15", 10, talk("c15", "Lucía", f"Close-up from the chest up of {LUC} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, taps the silver fountain pen on her palm, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small satisfied half smile. Nobody else around.",
     "charismatic, confident, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Usted me humilló frente a toda la oficina.", "Usted me hizo menos frente a toda la oficina."), ("No una secretaria que lloraba en el baño.", "No una secretaria de hace años."),
        ("contained anger", "emotion"), ("contemptuous", "cool"), ("scornful", "amused"), ("stunned", "surprised"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, soft morning light in a modern boardroom of a tequila company in Guadalajara, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, modern corporate boardroom with glass walls in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ERNESTO_VALDIVIA}", "a heavy-set Mexican man around sixty with slicked-back grey hair, a grey goatee and a dark-navy pinstripe suit"),
         ("@{LUCIA_MENDEZ}", "a Mexican businesswoman around forty with sleek straight black shoulder-length hair and a tailored ivory pantsuit"),
         ("@{MAURICIO_VALDIVIA}", "a Mexican man in his early thirties with a styled black quiff, a slim light-grey suit and a pink shirt"),
         ("@{BEATRIZ_VALDIVIA}", "an elegant Mexican woman in her late fifties with a short light-brown bob, pearl earrings and a camel wool coat"),
         (" @{LOC_JUNTAGUADALAJARA}", "")]
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
