"""Genera los clips de cafetal-coatepec PARTE 1 (La Patrona del Cafetal, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #45 "La patrona que dejaron en el altar" [CAPO] (Patronas y haciendas), cierre tipo 7 (objeto que delata): en el patio de secado de su hacienda cafetalera en Coatepec,
la temida patrona Griselda (45) recibe a Celestino (40), un capataz sin recomendación que le sostiene la mirada. La mayordoma Felipa (61) cuenta que a la patrona la dejaron en el altar.
Él se va contratado y se le cae la cartera: Felipa la recoge y adentro está la foto de Griselda vestida de novia.
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
# Geografía fija (patio de secado): Griselda a la DERECHA junto a los arcos; Felipa a la DERECHA un paso detrás de ella; Celestino a la IZQUIERDA junto al café tendido.
YARD0 = ("on the large stone drying patio of an old coffee hacienda in Coatepec, Veracruz @{LOC_CAFETALCOATEPEC} in the misty morning: red coffee cherries and pale beans spread to dry on the stones, "
         "white colonial arches with red tile roofs, green coffee plants on the hills beyond, soft fog; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
GRI = ("@{GRISELDA_MONTIEL} (45-year-old Mexican woman, fair skin, straight jet-black hair in a severe high ponytail, sharp cheekbones, dark red lipstick, a fitted black riding jacket over a white blouse)")
CEL = ("@{CELESTINO_BARRAGAN} (40-year-old Mexican man, tanned brown skin, short dark hair, a short dark beard, calm deep-set eyes, a worn brown leather jacket over a grey henley shirt, a palm-leaf hat in his hand)")
FEL = ("@{FELIPA_CRUZ} (61-year-old Mexican woman, brown skin, grey curly hair tied back with a white ribbon, kind round face, a pale-yellow blouse, a white cotton shawl)")
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

GRI_B = "@{GRISELDA_MONTIEL} seen from behind (jet-black high ponytail, fitted black riding jacket)"
CEL_B = "@{CELESTINO_BARRAGAN} seen from behind (short dark hair, worn brown leather jacket)"
FEL_B = "@{FELIPA_CRUZ} seen from behind (grey curly hair tied with a white ribbon, white cotton shawl)"
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

GR = "standing on the RIGHT by the white arches"
FR = "standing on the RIGHT a step behind the patrona, by the arches"
CL = "standing on the LEFT beside the coffee spread on the stones"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Griselda YA hablando, seca, Celestino de espaldas en el borde.
 ("c01", 6, S("c01", "Griselda", f"Medium close-up of {GRI} {YARD0}, {GR}, talking from the very first frame, cold and dry, arms crossed", CEL_B, "LEFT", "cold, dry, commanding",
     f"Medium close-up of {GRI} {YARD}, {GR}, talking from the very first frame, cold and dry", "LEFT")),
 ("c02", 6, S("c02", "Celestino", f"Close-up of {CEL} {YARD0}, {CL}, calm, holding her gaze without blinking, respectful but firm", GRI_B, "RIGHT", "calm, respectful, firm",
     f"Close-up of {CEL} {YARD}, {CL}, calm, holding the gaze", "RIGHT")),
 ("c03", 6, S("c03", "Felipa", f"Close-up of {FEL} {YARD0}, {FR}, leaning toward the patrona, talking low with a small amused smile", GRI_B, "LEFT", "low, amused, friendly",
     f"Close-up of {FEL} {YARD}, {FR}, talking low with a small smile", "LEFT")),
 ("c04", 6, S("c04", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, sharp, she raises her chin and narrows her eyes at him", CEL_B, "LEFT", "sharp, cold, suspicious",
     f"Close-up of {GRI} {YARD}, {GR}, sharp, chin raised", "LEFT")),
 ("c05", 6, S("c05", "Celestino", f"Close-up of {CEL} {YARD0}, {CL}, serene, turning the palm-leaf hat in his hands", GRI_B, "RIGHT", "serene, simple, honest",
     f"Close-up of {CEL} {YARD}, {CL}, serene, turning his hat", "RIGHT")),
 ("c06", D8("c06"), S("c06", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, bitter and guarded, a hard look", CEL_B, "LEFT", "bitter, guarded, cold",
     f"Close-up of {GRI} {YARD}, {GR}, bitter and guarded", "LEFT")),
 ("c07", 6, S("c07", "Felipa", f"Close-up of {FEL} {YARD0}, {FR}, softly, almost whispering to the man, with sad eyes", CEL_B, "LEFT", "soft, sad, confiding",
     f"Close-up of {FEL} {YARD}, {FR}, softly, sad eyes", "LEFT")),
 ("c08", 6, S("c08", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, she turns her head sharply toward the housekeeper, furious, eyes burning", FEL_B, "RIGHT", "furious, sharp, hurt",
     f"Close-up of {GRI} {YARD}, {GR}, furious, turning her head sharply", "RIGHT")),
 ("c09", 6, S("c09", "Celestino", f"Close-up of {CEL} {YARD0}, {CL}, quiet and sincere, a shadow of guilt in his eyes", GRI_B, "RIGHT", "quiet, sincere, heavy",
     f"Close-up of {CEL} {YARD}, {CL}, quiet and sincere", "RIGHT")),
 ("c10", 6, S("c10", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, cold again, intrigued despite herself, she studies his face", CEL_B, "LEFT", "cold, controlled, curt",
     f"Close-up of {GRI} {YARD}, {GR}, cold, studying him", "LEFT")),
 ("r1", 6, one(f"Medium shot of {CEL} {YARD}, {CL}, he nods, puts on his palm-leaf hat, turns and walks away across the patio; as he turns, a small worn leather wallet slips out of his jacket and falls onto the stones without him noticing", "RIGHT") + " No dialogue."),
 ("i01", 6, f"Close-up insert {YARD0}: wrinkled old hands opening a worn leather wallet; inside, an old faded printed photograph of a bride in a white wedding dress and veil, the face of @{{GRISELDA_MONTIEL}} younger, standing beside a young groom; no readable text, no faces other than in the photo. No dialogue."),
 ("c11", 6, talk("c11", "Felipa", one(f"Close-up of {FEL} {YARD}, {FR}, holding an open worn leather wallet, one hand over her mouth, stunned, whispering, then lifting her eyes", "LEFT"), "stunned, whispering, frightened")),
 ("r2", 6, one(f"Close-up of {GRI} {YARD}, {GR}, frozen, her hard mask breaks for a second, her lips part, her eyes go to the wallet, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Celestino a cámara
 ("c12", 10, talk("c12", "Celestino", f"Close-up from the chest up of {CEL} {YARD}, standing, alone, bareheaded, holding his single palm-leaf hat against his chest with one hand, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, turns the hat slowly in his hand, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("furious, sharp, hurt", "upset, hurt"), ("furious", "upset"), ("bitter", "serious"), ("burning", "intense"),
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
          "Vertical scene from a Mexican TV drama, realistic, soft misty morning light on the drying patio of a coffee hacienda in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, coffee hacienda patio with white arches in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GRISELDA_MONTIEL}", "a stern Mexican woman in her forties with a jet-black high ponytail, dark red lipstick and a fitted black riding jacket"),
         ("@{CELESTINO_BARRAGAN}", "a Mexican man around forty with a short dark beard, a worn brown leather jacket and a palm-leaf hat"),
         ("@{FELIPA_CRUZ}", "a kind Mexican woman in her sixties with grey curly hair tied with a white ribbon, a pale-yellow blouse and a white shawl"),
         (" @{LOC_CAFETALCOATEPEC}", "")]
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
