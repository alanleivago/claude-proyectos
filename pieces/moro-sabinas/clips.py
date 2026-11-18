"""Genera los clips de moro-sabinas PARTE 1 (El Moro de Sabinas, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #54 "El patrón en otro cuerpo" [CAPO] (Patronas y haciendas), cierre tipo 4 (el villano descubre que lo oyeron): en la caballeriza de su rancho en Sabinas Hidalgo,
la joven viuda Marlene (36) presume con su amante Darío (41), el administrador, que ya manda ella. Tobías (58), el caballerango contratado ayer, cepilla al Moro y sabe cosas que solo
el difunto don Rigoberto sabía. Darío se da cuenta: "este hombre oyó todo".
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
# Geografía fija (caballeriza): Marlene a la DERECHA junto a la puerta ancha; Darío frente a ella, también cerca de la puerta; Tobías a la IZQUIERDA en el establo abierto con el caballo negro.
STB0 = ("in an old wooden horse stable of a cattle ranch in Sabinas Hidalgo, Nuevo Leon @{LOC_CABALLERIZASABINAS} in the bright morning: wooden stalls, hay bales, saddles on racks, dusty sunbeams through the slats, "
        "a beautiful black horse in an open stall; no readable text, no signs, no logos")
STB = STB0 + "; nobody else in the background, no extras, nobody besides the person described"
MAR = ("@{MARLENE_SALINAS} (36-year-old Mexican woman, fair skin, long platinum-blonde wavy hair, heavy eyeliner, glossy pink lips, a fitted black satin blouse, large gold earrings)")
DAR = ("@{DARIO_LOZANO} (41-year-old Mexican man, light-brown skin, slicked-back black hair, a groomed black beard, a fitted burgundy polo shirt, a big silver belt buckle)")
TOB = ("@{TOBIAS_GUERRA} (58-year-old Mexican man, dark weathered skin, grey hair under an old straw cowboy hat, a grey mustache, calm grey eyes, a faded denim shirt with rolled sleeves)")
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

MAR_B = "@{MARLENE_SALINAS} seen from behind (long platinum-blonde wavy hair, black satin blouse)"
DAR_B = "@{DARIO_LOZANO} seen from behind (slicked-back black hair, burgundy polo shirt)"
TOB_B = "@{TOBIAS_GUERRA} seen from behind (old straw cowboy hat, faded denim shirt)"
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

MR = "standing on the RIGHT by the wide stable doorway"
DR = "standing near the stable doorway, facing her"
TL = "standing on the LEFT in the open stall, brushing the black horse"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Marlene YA hablando, triunfante, Darío de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Marlene", f"Medium close-up of {MAR} {STB0}, {MR}, talking from the very first frame, triumphant and smug, a satisfied smile, arms open as if the place is hers", DAR_B, "LEFT", "smug, triumphant, flirty",
     f"Medium close-up of {MAR} {STB}, {MR}, talking from the very first frame, smug and triumphant", "LEFT")),
 ("c02", 6, S("c02", "Darío", f"Close-up of {DAR} {STB0}, {DR}, a cold smug grin, leaning close to her", MAR_B, "RIGHT", "smug, cold, low",
     f"Close-up of {DAR} {STB}, {DR}, cold smug grin", "RIGHT")),
 ("c03", 6, S("c03", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, playing with her gold earring, careless and pleased", DAR_B, "LEFT", "careless, pleased, low",
     f"Close-up of {MAR} {STB}, {MR}, careless and pleased", "LEFT")),
 ("c04", 6, S("c04", "Darío", f"Close-up of {DAR} {STB0}, {DR}, he takes her hand, a greedy satisfied smile, voice low", MAR_B, "RIGHT", "greedy, satisfied, low",
     f"Close-up of {DAR} {STB}, {DR}, greedy satisfied smile", "RIGHT")),
 ("c05", 6, S("c05", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, without stopping the slow brushing, calm, eyes on the horse, then on her", MAR_B, "RIGHT", "calm, quiet, knowing",
     f"Close-up of {TOB} {STB}, {TL}, calm, brushing the horse", "RIGHT")),
 ("c06", 6, S("c06", "Darío", f"Close-up of {DAR} {STB0}, {DR}, letting go of her hand, turning sharply toward the stall, annoyed and arrogant", TOB_B, "LEFT", "arrogant, annoyed, sharp",
     f"Close-up of {DAR} {STB}, {DR}, annoyed and arrogant", "LEFT")),
 ("c07", 6, S("c07", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, he touches the brim of his straw hat politely, serene", DAR_B, "RIGHT", "polite, serene, simple",
     f"Close-up of {TOB} {STB}, {TL}, polite, touching his hat", "RIGHT")),
 ("c08", 6, S("c08", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, her smile frozen, nervous, glancing at Darío and back at the old man", TOB_B, "LEFT", "nervous, sharp, tense",
     f"Close-up of {MAR} {STB}, {MR}, nervous, smile frozen", "LEFT")),
 ("c09", 6, S("c09", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, calm, a hint of a smile, patting the black horse", MAR_B, "RIGHT", "calm, dry, polite",
     f"Close-up of {TOB} {STB}, {TL}, calm, patting the horse", "RIGHT")),
 ("c10", 6, S("c10", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, her smile gone, suspicious, narrowing her eyes at the old man", TOB_B, "LEFT", "suspicious, tense, cold",
     f"Close-up of {MAR} {STB}, {MR}, suspicious, smile gone", "LEFT")),
 ("c11", D8("c11"), S("c11", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, he looks around the old stable with quiet nostalgia", MAR_B, "RIGHT", "quiet, nostalgic, calm",
     f"Close-up of {TOB} {STB}, {TL}, quiet nostalgia", "RIGHT")),
 ("c12", 6, S("c12", "Darío", f"Close-up of {DAR} {STB0}, {DR}, a scornful laugh, stepping toward the stall", TOB_B, "LEFT", "dismissive, arrogant, cold",
     f"Close-up of {DAR} {STB}, {DR}, dismissive laugh", "LEFT")),
 ("c13", D8("c13"), S("c13", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, holding Darío's gaze calmly, a small pause before the last words", DAR_B, "RIGHT", "calm, meaningful, steady",
     f"Close-up of {TOB} {STB}, {TL}, holding the gaze calmly", "RIGHT")),
 ("c14", 6, S("c14", "Darío", f"Close-up of {DAR} {STB0}, {DR}, irritated, rolling up his sleeves, walking toward the black horse", TOB_B, "LEFT", "irritated, proud, challenging",
     f"Close-up of {DAR} {STB}, {DR}, irritated, walking toward the horse", "LEFT")),
 ("r1", 6, f"Medium shot {STB}: {DAR} reaches for the halter of the black horse in the open stall; the horse snorts, tosses its head and steps back away from him, refusing him, nobody is hurt; {TOB} stands calmly beside the horse; only these two people. No dialogue."),
 ("c15", D8("c15"), S("c15", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, he strokes the black horse's neck gently and speaks softly, a small pause before the last words, a calm knowing look", DAR_B, "RIGHT", "soft, calm, meaningful",
     f"Close-up of {TOB} {STB}, {TL}, stroking the horse, soft and knowing", "RIGHT")),
 ("r2", 6, one(f"Medium close-up of {TOB} {STB}, {TL}, he whispers something into the black horse's ear and the horse lowers its head, completely calm", "RIGHT") + " No dialogue."),
 ("c16", 6, S("c16", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, pale, she grabs Darío's arm and whispers, frightened", DAR_B, "LEFT", "whispering, worried, tense",
     f"Close-up of {MAR} {STB}, {MR}, whispering, worried", "LEFT")),
 ("c17", 6, S("c17", "Darío", f"Close-up of {DAR} {STB0}, {DR}, the grin gone, he leans to her and whispers, tense, without taking his eyes off the old man", MAR_B, "RIGHT", "whispering, tense, alarmed",
     f"Close-up of {DAR} {STB}, {DR}, whispering, tense", "RIGHT")),
 ("r3", 6, one(f"Close-up of {MAR} {STB}, {MR}, frozen, the color drains from her face, she slowly turns her head toward the stall, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r4", 6, one(f"Close-up of {TOB} {STB}, {TL}, he keeps brushing the black horse slowly, then lifts his calm grey eyes to them, a tiny knowing smile under the mustache, silent", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Tobías a cámara
 ("c18", 10, talk("c18", "Tobías", f"Close-up from the chest up of {TOB} {STB}, standing by the black horse, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, pats the horse's neck, adjusts his straw hat, raises one eyebrow, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("smug, triumphant, flirty", "smug, pleased"), ("whispering, tense, alarmed", "whispering, tense"), ("the color drains from her face", "her expression changes"), ("alarmed", "worried"),
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
          "Vertical scene from a Mexican TV drama, realistic, bright morning sunbeams in an old wooden horse stable on a ranch in northern Mexico, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, ranch horse stable with a black horse in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MARLENE_SALINAS}", "a Mexican woman in her thirties with long platinum-blonde wavy hair, a black satin blouse and gold earrings"),
         ("@{DARIO_LOZANO}", "a Mexican man around forty with slicked-back black hair, a groomed beard and a burgundy polo shirt"),
         ("@{TOBIAS_GUERRA}", "an older Mexican stable hand with a grey mustache, an old straw cowboy hat and a faded denim shirt"),
         (" @{LOC_CABALLERIZASABINAS}", "")]
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
