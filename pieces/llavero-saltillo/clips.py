"""Genera los clips de llavero-saltillo PARTE 1 (El Llavero de Saltillo, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #8 "Las llaves de la bodega" (Herencia y testamento; con figura de poder: don Gregorio, el patrón de los camiones), cierre tipo 1 (entra un personaje inesperado):
en la lectura del testamento, los hijos Reinaldo (46) y Zulema (41) se burlan de la nuera viuda Itzayana (32), que cuidó al patrón; a ella le toca solo un llavero viejo:
la llave de una bodega de la calle Allende que "nadie conocía". Ella la abre al anochecer: sentada bajo una lámpara la espera una señora elegante (63): "Te estaba esperando, Itzayana."
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
# Geografía fija (despacho): el notario Olegario SENTADO detrás del escritorio al CENTRO; Itzayana de pie a la IZQUIERDA; Reinaldo y Zulema de pie a la DERECHA (Zulema más cerca del escritorio).
OFF0 = ("in the wood-paneled private office of a late powerful businessman in Saltillo, Coahuila @{LOC_DESPACHOSALTILLO} in the afternoon: a large dark wooden desk with a green banker's lamp, leather armchairs, bookshelves, "
        "a big window with dry mountains in the distance; no readable text, no signs, no logos")
OFF = OFF0 + "; nobody else in the background, no extras, nobody besides the person described"
BOD0 = ("inside an old brick warehouse in Saltillo at dusk @{LOC_BODEGAALLENDE}: dusty wooden floor, old furniture covered with white sheets, stacked wooden crates, a single warm floor lamp lit next to an old velvet armchair, "
        "high small windows with the last orange light; no readable text, no signs, no logos")
BOD = BOD0 + "; nobody else in the background, no extras, nobody besides the person described"
ITZ = ("@{ITZAYANA_CORDERO} (32-year-old Mexican woman, warm brown skin, long straight black hair in a low ponytail, kind tired dark eyes, no makeup, a simple navy-blue cardigan over a white blouse, a thin gold chain)")
ZUL = ("@{ZULEMA_MONTEMAYOR} (41-year-old Mexican woman, fair skin, a blonde highlighted bob, red lipstick, a cream designer blazer, large pearl earrings, big sunglasses pushed up on her head)")
REI = ("@{REINALDO_MONTEMAYOR} (46-year-old Mexican man, light skin, slicked-back black hair with grey temples, a trimmed black beard, a charcoal suit with an open-collar white shirt, a gold watch)")
OLE = ("@{OLEGARIO_ZERTUCHE} (66-year-old Mexican man, bald on top with white hair on the sides, round wire glasses, a white mustache, a brown tweed jacket and a dark-red bow tie)")
MUJ = ("@{MUJER_BODEGA} (63-year-old elegant Mexican woman, light-brown skin, silver hair in a neat chignon, dark serene eyes, an emerald-green shawl over a long black dress, small emerald earrings)")
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

ITZ_B = "@{ITZAYANA_CORDERO} seen from behind (long black low ponytail, navy-blue cardigan)"
ZUL_B = "@{ZULEMA_MONTEMAYOR} seen from behind (blonde bob with sunglasses on her head, cream blazer)"
REI_B = "@{REINALDO_MONTEMAYOR} seen from behind (slicked-back black hair with grey temples, charcoal suit jacket)"
OLE_B = "@{OLEGARIO_ZERTUCHE} seen from behind (bald head with white hair on the sides, brown tweed jacket)"
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

IL = "standing on the LEFT in front of the desk"
ZR = "standing on the RIGHT in front of the desk"
RR = "standing on the RIGHT next to his sister"
OC = "sitting behind the big desk in the CENTER, a leather folder open in front of him"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def T(cid, who, other, desc, tone, one_desc, one_side):
    return (talk(cid, who, two(desc) + " " + MOUTH(who, other), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Zulema YA hablando con desprecio, Itzayana de espaldas en el borde.
 ("c01", 6, S("c01", "Zulema", f"Medium close-up of {ZUL} {OFF0}, {ZR}, talking from the very first frame, looking her up and down with contempt, arms crossed", ITZ_B, "LEFT", "contemptuous, mocking, cold",
     f"Medium close-up of {ZUL} {OFF}, {ZR}, talking from the very first frame, contemptuous", "LEFT")),
 ("c02", D8("c02"), S("c02", "Itzayana", f"Close-up of {ITZ} {OFF0}, {IL}, calm and dignified, holding back her hurt", ZUL_B, "RIGHT", "calm, dignified, soft",
     f"Close-up of {ITZ} {OFF}, {IL}, calm and dignified", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, a cruel half smile, adjusting his gold watch", ITZ_B, "LEFT", "cruel, mocking, dismissive",
     f"Close-up of {REI} {OFF}, {RR}, cruel half smile", "LEFT")),
 ("c04", 6, S("c04", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, raising one hand for calm, then adjusting his round glasses", REI_B, "RIGHT", "calm, formal, firm",
     f"Close-up of {OLE} {OFF}, {OC}, raising one hand for calm", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, reading formally from the papers in the leather folder", REI_B, "RIGHT", "formal, slow, clear",
     f"Close-up of {OLE} {OFF}, {OC}, reading formally from a folder", "RIGHT")),
 ("r1", 6, two(f"{ZUL} {ZR} and {REI} {RR} {OFF}, the two siblings exchange a satisfied smug smile, Zulema touches her pearl earring") + " " + MUTE),
 ("c06", 6, S("c06", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, a short pause, he slides something small across the desk toward the woman on the left", ITZ_B, "LEFT", "formal, slow, a little solemn",
     f"Close-up of {OLE} {OFF}, {OC}, sliding something across the desk", "LEFT")),
 ("i01", 6, f"Close-up insert {OFF0}: on the dark wooden desk, an old rusty iron key ring with one big old key and a small worn leather tag, a woman's hand slowly picks it up; no readable text. No dialogue."),
 ("c07", 6, S("c07", "Zulema", f"Close-up of {ZUL} {OFF0}, {ZR}, bursting into a mocking laugh, pointing with her chin at the key ring", ITZ_B, "LEFT", "mocking, laughing, cruel",
     f"Close-up of {ZUL} {OFF}, {ZR}, mocking laugh", "LEFT")),
 ("c08", 6, S("c08", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, smug, hands in his pockets", ITZ_B, "LEFT", "smug, cold, dismissive",
     f"Close-up of {REI} {OFF}, {RR}, smug", "LEFT")),
 ("c09", D8("c09"), S("c09", "Itzayana", f"Close-up of {ITZ} {OFF0}, {IL}, holding the old key ring in her hand, eyes shining, dignified", REI_B, "RIGHT", "dignified, hurt, steady",
     f"Close-up of {ITZ} {OFF}, {IL}, holding an old key ring, dignified", "RIGHT")),
 ("c10", D8("c10"), S("c10", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, leaning forward, lowering his voice, looking at her over his round glasses", ITZ_B, "LEFT", "low, serious, meaningful",
     f"Close-up of {OLE} {OFF}, {OC}, leaning forward, serious", "LEFT")),
 ("c11", 6, S("c11", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, his smile freezes, he takes his hands out of his pockets, tense", OLE_B, "LEFT", "tense, defensive, fast",
     f"Close-up of {REI} {OFF}, {RR}, tense, smile frozen", "LEFT")),
 ("c12", D8("c12"), S("c12", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, calm, a knowing look at the eldest son", REI_B, "RIGHT", "calm, knowing, firm",
     f"Close-up of {OLE} {OFF}, {OC}, calm and knowing", "RIGHT")),
 ("r2", 6, two(f"{ZUL} {ZR} and {REI} {RR} {OFF}, Zulema turns to her brother confused, Reinaldo avoids her eyes and swallows") + " " + MUTE),
 ("c13", 6, T("c13", "Zulema", "Reinaldo", f"{ZUL} and {REI} {OFF0}, side by side, she turns to her brother, confused and suspicious, he stares ahead", "confused, suspicious, sharp",
     f"Close-up of {ZUL} {OFF}, {ZR}, confused and suspicious", "LEFT")),
 ("c14", 6, S("c14", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, stepping toward her, holding out his open hand, hard and nervous", ITZ_B, "LEFT", "hard, nervous, demanding",
     f"Close-up of {REI} {OFF}, {RR}, holding out his open hand, demanding", "LEFT")),
 ("c15", 6, S("c15", "Itzayana", f"Close-up of {ITZ} {OFF0}, {IL}, closing her hand around the old key ring, firm and calm for the first time", REI_B, "RIGHT", "firm, calm, brave",
     f"Close-up of {ITZ} {OFF}, {IL}, closing her hand around a key ring, firm", "RIGHT")),
 ("r3", 6, f"Medium shot of {ITZ} at dusk on an empty old street in Saltillo, standing in front of the old wooden double door of a brick warehouse, she puts the big old key into the lock and turns it; nobody else around; no readable text, no signs. Nobody speaks. No dialogue."),
 ("r4", 6, one(f"Medium shot of {ITZ} {BOD}, she pushes the door open and steps slowly into the dim warehouse, looking around, holding the key ring, uneasy", "RIGHT") + " " + MUTE),
 ("c16", 6, talk("c16", "Itzayana", one(f"Close-up of {ITZ} {BOD}, walking slowly between the furniture covered with white sheets, calling out softly into the dim warehouse, uneasy", "RIGHT"), "uneasy, soft, calling out")),
 ("r5", 6, one(f"Medium shot of {MUJ} {BOD}, sitting very still in the old velvet armchair under the warm floor lamp, she slowly turns her head toward the camera and smiles serenely", "LEFT") + " Slow push-in. " + MUTE),
 ("c17", D8("c17"), S("c17", "The lady", f"Close-up of {MUJ} {BOD0}, sitting in the velvet armchair under the lamp, serene, a small mysterious smile", ITZ_B, "LEFT", "serene, warm, mysterious",
     f"Close-up of {MUJ} {BOD}, sitting in a velvet armchair, serene, mysterious smile", "LEFT")),
 # CTA con carisma (después del BLACK): Itzayana a cámara
 ("c18", 10, talk("c18", "Itzayana", f"Close-up from the chest up of {ITZ} {BOD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, holds up the old key ring for a second, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous, mocking, cold", "cold, dismissive"), ("mocking, laughing, cruel", "laughing, amused"), ("cruel, mocking, dismissive", "smug, dismissive"), ("cruel half smile", "smug half smile"), ("cruel", "smug"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a wood-paneled office, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family office, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ITZAYANA_CORDERO}", "a young Mexican woman with a long black low ponytail and a navy-blue cardigan"),
         ("@{ZULEMA_MONTEMAYOR}", "a Mexican woman in her forties with a blonde bob, red lipstick and a cream blazer"),
         ("@{REINALDO_MONTEMAYOR}", "a Mexican man in his forties with slicked-back hair, grey temples, a trimmed beard and a charcoal suit"),
         ("@{OLEGARIO_ZERTUCHE}", "an old Mexican man with round wire glasses, a white mustache, a tweed jacket and a bow tie"),
         ("@{MUJER_BODEGA}", "an elegant older Mexican woman with silver hair in a chignon and an emerald-green shawl"),
         (" @{LOC_DESPACHOSALTILLO}", ""), (" @{LOC_BODEGAALLENDE}", "")]
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
