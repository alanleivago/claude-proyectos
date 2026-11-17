"""Genera los clips de jarana-tlacotalpan PARTE 1 (La Jarana de Tlacotalpan, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la matriarca -> plazo invertido -> giro familiar): en la fiesta de Tlacotalpan, Veracruz, Lorena (40), organizadora y nuera de doña Cristina,
quiere quitar el puesto del jaranero don Matías (72) "antes de que salga la procesión" y le tira una jarana; su nieto Ismael (26) lo defiende. La jarana era el encargo de doña Cristina (68):
la de su difunto marido. Plazo invertido. Giro: Lorena revela que Ismael no es nieto de Matías sino de Cristina (hijo de Rodolfo).
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
# Geografía fija (plaza): Matías e Ismael a la IZQUIERDA (puesto de jaranas); Lorena y Cristina a la DERECHA (en la plaza).
YARD0 = ("in a colonial plaza in Tlacotalpan, Veracruz @{LOC_PLAZATLACOTALPAN} during the town festival in the afternoon: brightly painted houses with arcades in blue, pink and yellow, "
         "a small wooden stall with handmade jarana guitars hanging, papel picado without letters overhead, palm trees, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
JARANA = "a small handmade jarana guitar of dark polished wood"
MAT = ("@{MATIAS_REYES} (72-year-old Mexican man, thin, dark-brown skin, short white curly hair, a white mustache, a white embroidered guayabera, a red bandana around his neck)")
ISM = ("@{ISMAEL_REYES} (26-year-old Mexican man, brown skin, short curly black hair, light stubble, a plain light-blue cotton shirt with rolled sleeves)")
LOR = ("@{LORENA_OCHOA} (40-year-old Mexican woman, light skin, long straight highlighted light-brown hair, big gold earrings, red lipstick, an elegant white off-shoulder dress)")
CRI = ("@{CRISTINA_AGUIRRE} (68-year-old elegant Mexican matriarch, light-brown skin, silver hair in a bun with a red flower, a black embroidered dress with a black lace shawl)")
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

# Bordes: Lorena o Cristina le hablan a Matías/Ismael -> espalda LEFT; Matías o Ismael les hablan -> espalda RIGHT.
MAT_B = "@{MATIAS_REYES} seen from behind (short white curly hair, white guayabera, the knot of a red bandana)"
ISM_B = "@{ISMAEL_REYES} seen from behind (short curly black hair, light-blue cotton shirt)"
LOR_B = "@{LORENA_OCHOA} seen from behind (long straight highlighted hair, white off-shoulder dress)"
CRI_B = "@{CRISTINA_AGUIRRE} seen from behind (silver hair in a bun with a red flower, black lace shawl)"
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

ML = "standing on the LEFT behind his wooden stall of jaranas"            # Matías
IL = "standing on the LEFT beside the jarana stall"                       # Ismael
LR = "standing on the RIGHT in the plaza, fanning herself"                # Lorena
CR = "standing on the RIGHT in the plaza"                                 # Cristina

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Lorena YA hablando abanicándose frente al puesto; Matías de espaldas (LEFT). Plazo: antes de que salga la procesión.
 ("c01", D8("c01"), S("c01", "Lorena", f"Medium close-up of {LOR} {YARD0}, {LR}, talking from the very first frame, arrogant and bossy, she points at the stall with her closed fan", MAT_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {LOR} {YARD}, {LR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Matías", f"Close-up of {MAT} {YARD0}, {ML}, calm and proud, holding {JARANA}", LOR_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {MAT} {YARD}, {ML}, calm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, a cold smile, she looks at the jaranas with disdain", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {ISM} {YARD}, {IL}, already in place tuning a jarana, he stops and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young man in a light-blue shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Ismael", f"Close-up of {ISM} {YARD0}, {IL}, firm and protective", LOR_B, "RIGHT", "firm, protective",
     f"Close-up of {ISM} {YARD}, {IL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Lorena", f"Close-up of {LOR} {YARD0}, {LR}, offended, she snaps her fan shut", ISM_B, "LEFT", "offended, cold",
     f"Close-up of {LOR} {YARD}, {LR}, offended", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with red nails and gold bracelets slowly knocks {JARANA} off the wooden stall and it falls onto the cobblestones; only the hand, the stall and the jarana, no face. No dialogue."),
 ("c06", 6, S("c06", "Matías", f"Close-up of {MAT} {YARD0}, {ML}, his eyes shine, calm and serious, he looks down at the fallen jarana", LOR_B, "RIGHT", "calm, serious, low",
     f"Close-up of {MAT} {YARD}, {ML}, his eyes shine, calm and serious", "RIGHT")),
 ("c07", 6, talk("c07", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, she laughs and fans herself, mocking", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of an elegant dark car stopping slowly on a cobblestone street with brightly painted colonial houses with arcades in Tlacotalpan, Veracruz, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {CRI} {YARD}, {CR}, already standing in place, she slowly opens her black fan, elegant, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in black lace')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, warm and respectful, a small smile", MAT_B, "LEFT", "warm, respectful, calm",
     f"Close-up of {CRI} {YARD}, {CR}, warm and respectful", "LEFT")),
 ("c09", 6, talk("c09", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, she turns, pale and nervous, she stops fanning", "RIGHT"), "surprised, nervous")),
 ("c10", D8("c10"), (talk("c10", "Cristina", two(f"{MAT} on the LEFT holding the fallen jarana and {CRI} on the RIGHT, facing each other beside the stall {YARD0}, framed from the waist up; "
     f"Cristina, moved, touches the jarana, slightly closer to the camera and in sharper focus") + " " + MOUTH("Cristina", "Matías"), "moved, soft"),
   talk("c10", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, moved, her eyes shine", "LEFT"), "moved, soft"))),
 ("c11", 6, talk("c11", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, nervous, a forced smile", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, cold and final, she points at the jarana with her closed fan", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {LOR} {YARD}, bending down in her white dress, she picks up the jarana from the cobblestones and holds it out, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman in a white dress')}. No dialogue."),
 ("c13", 6, S("c13", "Ismael", f"Close-up of {ISM} {YARD0}, {IL}, grateful, a small shy smile", CRI_B, "RIGHT", "grateful, shy",
     f"Close-up of {ISM} {YARD}, {IL}, grateful", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, she looks at the young man carefully, curious and moved", ISM_B, "LEFT", "curious, moved, slow",
     f"Close-up of {CRI} {YARD}, {CR}, curious and moved", "LEFT")),
 ("c15", 6, talk("c15", "Ismael", one(f"Close-up of {ISM} {YARD}, {IL}, polite, a little confused", "RIGHT"), "polite, confused")),
 ("c16", D8("c16"), talk("c16", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, holding the jarana, a sudden spiteful smile", "RIGHT"), "spiteful, sly")),
 ("r4", 6, one(f"Close-up of {MAT} {YARD}, {ML}, in silence, he closes his eyes and lowers his head, guilty", "RIGHT") + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, stunned, her fan trembles in her hand, her eyes shine", "LEFT"), "stunned, emotional")),
 # CTA con carisma (después del BLACK): Cristina sola, a cámara
 ("c18", 10, talk("c18", "Cristina", f"Close-up from the chest up of {CRI} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, opens her black fan slowly, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small mysterious half smile. Nobody else around.",
     "charismatic, elegant, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Doña Cristina no compra baratijas, viejo.", "Doña Cristina no compra cosas así, don."), ("Y sus jaranas viejas afean la plaza.", "Y sus jaranas no van con la fiesta."),
        ("knocks", "moves"), ("falls onto the cobblestones", "rests on the cobblestones"), ("humiliated", "quiet"), ("spiteful", "small"), ("stunned", "surprised"),
        ("trembles", "stops"), ("offended", "surprised"), ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a colorful colonial plaza in Tlacotalpan, Veracruz, during a festival, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colorful colonial plaza with a stall of handmade guitars in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MATIAS_REYES}", "a thin elderly Mexican man with white curly hair, a white mustache, a white guayabera and a red bandana"),
         ("@{ISMAEL_REYES}", "a young Mexican man in his twenties with short curly black hair and a light-blue cotton shirt"),
         ("@{LORENA_OCHOA}", "a Mexican woman around forty with long highlighted hair, gold earrings and an elegant white off-shoulder dress"),
         ("@{CRISTINA_AGUIRRE}", "an elegant elderly Mexican woman with a silver bun with a red flower, a black dress and a black lace shawl"),
         (" @{LOC_PLAZATLACOTALPAN}", "")]
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
