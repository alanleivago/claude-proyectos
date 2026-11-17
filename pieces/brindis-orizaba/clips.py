"""Genera los clips de brindis-orizaba PARTE 1 (El Brindis de Orizaba, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #19 "El brindis" [CAPO], cierre tipo 5 (se vuelve la acusación contra quien acusa): en la fiesta de compromiso de Diego (30), hijo del cacique don Clemente Salas (65), el padrino
Tomás (56) brinda con indirectas sobre el pasado de la novia Valeria (28); doña Mercedes (60) la desprecia. Valeria toma el micrófono: sí tuvo otro apellido, pero ella no va los jueves al hotel
del centro… "Pregúntele a su esposa, don Clemente." Mercedes y el padrino se quedan helados.
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
# Geografía fija (jardín): Tomás de pie al CENTRO-DERECHA junto al micrófono; Valeria y Diego a la IZQUIERDA en la mesa principal; Clemente y Mercedes a la DERECHA en la mesa principal.
YARD0 = ("in the garden of an old hacienda in Orizaba, Veracruz @{LOC_JARDINORIZABA} at night during an engagement party: string lights overhead, round tables with white tablecloths and white flowers, "
         "a long head table with crystal glasses, a small wooden stage with a microphone stand, tropical plants, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
TOM = ("@{TOMAS_ARCE} (56-year-old Mexican man, tall and thin, tanned skin, slicked-back salt-and-pepper hair, a thin mustache, a white embroidered guayabera)")
VAL = ("@{VALERIA_RIOS} (28-year-old Mexican woman, light-brown skin, long wavy dark-brown hair half up, small gold earrings, an elegant light-pink satin cocktail dress)")
DIE = ("@{DIEGO_SALAS} (30-year-old Mexican man, fair skin, short neat black hair, clean-shaven, a navy-blue suit, a white shirt, a light-blue tie)")
CLE = ("@{CLEMENTE_SALAS} (65-year-old Mexican man, heavy-set, light skin, white hair, a white beard, a cream panama hat, a black linen jacket over a black shirt, a gold chain)")
MER = ("@{MERCEDES_SALAS} (60-year-old Mexican woman, fair skin, voluminous dyed red hair, heavy makeup, big emerald earrings, an emerald-green sequined evening dress)")
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

TOM_B = "@{TOMAS_ARCE} seen from behind (slicked-back salt-and-pepper hair, white embroidered guayabera, tall and thin)"
VAL_B = "@{VALERIA_RIOS} seen from behind (long wavy dark-brown hair half up, light-pink satin dress)"
CLE_B = "@{CLEMENTE_SALAS} seen from behind (cream panama hat, black linen jacket, heavy-set)"
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

TR = "standing on the RIGHT near the microphone stand, holding a glass of champagne"
VL = "standing on the LEFT at the head table"
DL = "standing on the LEFT at the head table beside his fiancée"
CR = "sitting on the RIGHT at the head table"
MR = "sitting on the RIGHT at the head table, next to her husband"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Tomás YA hablando, copa en alto; Valeria de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Tomás", f"Medium close-up of {TOM} {YARD0}, {TR}, talking from the very first frame, raising his glass, a sly venomous smile", VAL_B, "LEFT", "sly, ironic, loud",
     f"Medium close-up of {TOM} {YARD}, {TR}, talking from the very first frame, raising his glass, a sly smile", "LEFT")),
 ("c02", 6, S("c02", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, a frozen polite smile, holding her glass", TOM_B, "RIGHT", "polite, tense, soft",
     f"Close-up of {VAL} {YARD}, {VL}, a frozen polite smile", "RIGHT")),
 ("c03", 6, talk("c03", "Tomás", one(f"Close-up of {TOM} {YARD}, {TR}, he shakes his head slowly, enjoying it", "LEFT"), "sly, slow")),
 ("r1", 6, f"Medium shot of {CLE} {YARD}, {CR}, already in place, he slowly puts down his glass, serious and heavy, {gaze('LEFT')}; {ALONE}; {NODOUBLE('man in a cream panama hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Clemente", one(f"Close-up of {CLE} {YARD}, {CR}, serious, a warning look", "LEFT"), "serious, heavy, low")),
 ("c05", D8("c05"), S("c05", "Tomás", f"Close-up of {TOM} {YARD0}, {TR}, he turns to the boss with a fake respectful bow", CLE_B, "RIGHT", "sly, fake respectful",
     f"Close-up of {TOM} {YARD}, {TR}, a fake respectful bow", "RIGHT")),
 ("c06", 6, S("c06", "Diego", f"Close-up of {DIE} {YARD0}, {DL}, annoyed and protective, he puts a hand on his fiancée's back", TOM_B, "RIGHT", "annoyed, firm",
     f"Close-up of {DIE} {YARD}, {DL}, annoyed and protective", "RIGHT")),
 ("c07", 6, talk("c07", "Mercedes", two(f"{MER} on the RIGHT leaning toward {CLE} on the LEFT at the head table {YARD0}, framed from the waist up; she whispers to her husband with a smug smile, "
     f"slightly closer to the camera and in sharper focus") + " " + MOUTH("Mercedes", "Clemente"), "smug, whispering")),
 ("i01", 6, f"Close-up insert {YARD0}: crystal champagne glasses on the white tablecloth of the head table under the string lights, the bubbles rising, a small microphone lying beside them; no hands, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {VAL} {YARD}, {VL}, already in place, she puts down her glass, picks up the microphone from the table and straightens up, calm and decided, {gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a pink satin dress')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, holding the microphone, calm, a small dangerous smile", TOM_B, "RIGHT", "calm, sweet, dangerous",
     f"Close-up of {VAL} {YARD}, {VL}, holding the microphone, calm", "RIGHT")),
 ("c09", 6, talk("c09", "Tomás", one(f"Close-up of {TOM} {YARD}, {TR}, his smile gone, nervous, he lowers his glass", "LEFT"), "nervous, quick, low")),
 ("c10", 6, S("c10", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, holding the microphone, firm, looking straight at the padrino", TOM_B, "RIGHT", "firm, clear",
     f"Close-up of {VAL} {YARD}, {VL}, holding the microphone, firm", "RIGHT")),
 ("c11", 6, talk("c11", "Clemente", one(f"Close-up of {CLE} {YARD}, {CR}, frowning, confused, he leans forward", "LEFT"), "confused, heavy")),
 ("c12", 6, S("c12", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, holding the microphone, she slowly turns her eyes toward the boss's wife", CLE_B, "RIGHT", "calm, cutting, slow",
     f"Close-up of {VAL} {YARD}, {VL}, holding the microphone, calm and cutting", "RIGHT")),
 ("r3", 6, one(f"Close-up of {MER} {YARD}, {MR}, in silence, her smug smile freezes, she goes pale and slowly lowers her eyes", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Valeria sola, a cámara
 ("c13", 10, talk("c13", "Valeria", f"Close-up from the chest up of {VAL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small confident half smile. Nobody else around.",
     "charismatic, confident, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Pero yo no voy los jueves al hotel del centro.", "Pero yo no tengo citas los jueves en el centro."), ("venomous", "ironic"), ("dangerous", "confident"),
        ("smug", "proud"), ("cutting", "firm"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm string lights at night in the garden of a hacienda in Veracruz during an engagement party, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, elegant Mexican garden party at night, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm evening light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TOMAS_ARCE}", "a tall thin Mexican man in his fifties with slicked-back salt-and-pepper hair, a thin mustache and a white embroidered guayabera"),
         ("@{VALERIA_RIOS}", "a Mexican woman in her late twenties with long wavy dark-brown hair half up and a light-pink satin cocktail dress"),
         ("@{DIEGO_SALAS}", "a Mexican man around thirty with short neat black hair in a navy-blue suit and a light-blue tie"),
         ("@{CLEMENTE_SALAS}", "a heavy-set Mexican man in his sixties with a white beard, a cream panama hat and a black linen jacket"),
         ("@{MERCEDES_SALAS}", "a Mexican woman around sixty with voluminous dyed red hair, emerald earrings and an emerald-green sequined dress"),
         (" @{LOC_JARDINORIZABA}", "")]
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
