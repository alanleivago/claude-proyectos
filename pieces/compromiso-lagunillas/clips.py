"""Genera los clips de compromiso-lagunillas PARTE 1 (El Compromiso de Lagunillas, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #34 "El hijo del hacendado y la hija del rival" [CAPO] (Capos, caciques y patrones), cierre tipo 3 (palabra reveladora / confesión): en el jardín de su hacienda en San Pedro Lagunillas,
don Lázaro (66) rechaza a Carolina Benavides (27), novia de su hijo Marcelo (30): las familias no se hablan hace treinta años. Su esposa Estela (61) sale, reconoce en Carolina los ojos de su padre
y confiesa: "Yo estuve comprometida con su padre".
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
# Geografía fija (jardín): Lázaro a la DERECHA junto a los arcos de la fachada; Estela llega por la DERECHA y queda junto a él; Marcelo y Carolina a la IZQUIERDA, lado a lado, frente a la laguna.
GAR0 = ("in the front garden of an old hacienda by the lagoon of San Pedro Lagunillas, Nayarit @{LOC_JARDINLAGUNILLAS} in the warm late afternoon: green lawn, tall royal palms, a white facade with arches and a red tile roof, hibiscus in terracotta pots, "
        "the calm lagoon and green hills behind; no readable text, no signs, no logos")
GAR = GAR0 + "; nobody else in the background, no extras, nobody besides the person described"
LAZ = ("@{LAZARO_UGALDE} (66-year-old Mexican man, tanned skin, short grey hair, a thick grey mustache, bushy eyebrows, stern dark eyes, a white guayabera shirt, a cream palm hat)")
EST = ("@{ESTELA_UGALDE} (61-year-old Mexican woman, fair skin, shoulder-length auburn hair in soft waves, gentle sad hazel eyes, a lilac blouse, a thin gold chain with a small medal)")
MAR = ("@{MARCELO_UGALDE} (30-year-old Mexican man, light-brown skin, short dark-brown hair with a side part, clean-shaven, a light-blue button-up shirt with rolled sleeves)")
CAR = ("@{CAROLINA_BENAVIDES} (27-year-old Mexican woman, warm olive skin, long straight black hair with a center part, large hazel-green eyes, a coral summer dress with a white cardigan)")
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

LAZ_B = "@{LAZARO_UGALDE} seen from behind (cream palm hat, white guayabera shirt)"
EST_B = "@{ESTELA_UGALDE} seen from behind (shoulder-length auburn wavy hair, lilac blouse)"
MAR_B = "@{MARCELO_UGALDE} seen from behind (short dark-brown hair, light-blue shirt)"
CAR_B = "@{CAROLINA_BENAVIDES} seen from behind (long straight black hair, white cardigan over a coral dress)"
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

LR = "standing on the RIGHT by the white arches of the facade"
ER = "standing on the RIGHT beside her husband, by the arches"
ML = "standing on the LEFT beside his girlfriend, the lagoon behind"
CL = "standing on the LEFT beside her boyfriend, the lagoon behind"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Lázaro YA hablando, indignado, Marcelo de espaldas en el borde.
 ("c01", 6, S("c01", "Lázaro", f"Medium close-up of {LAZ} {GAR0}, {LR}, talking from the very first frame, indignant and hard, looking from his son to the young woman", MAR_B, "LEFT", "indignant, hard, scornful",
     f"Medium close-up of {LAZ} {GAR}, {LR}, talking from the very first frame, indignant", "LEFT")),
 ("c02", 6, S("c02", "Marcelo", f"Close-up of {MAR} {GAR0}, {ML}, determined, he takes a half step forward to stand by her", LAZ_B, "RIGHT", "determined, firm, respectful",
     f"Close-up of {MAR} {GAR}, {ML}, determined", "RIGHT")),
 ("c03", 6, S("c03", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, cold and final, a hard look at the young woman", CAR_B, "LEFT", "cold, final, proud",
     f"Close-up of {LAZ} {GAR}, {LR}, cold and final", "LEFT")),
 ("c04", D8("c04"), S("c04", "Carolina", f"Close-up of {CAR} {GAR0}, {CL}, polite but brave, chin up, holding his gaze", LAZ_B, "RIGHT", "polite, brave, steady",
     f"Close-up of {CAR} {GAR}, {CL}, polite but brave", "RIGHT")),
 ("c05", 6, S("c05", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, a bitter half-smile, provoking her", CAR_B, "LEFT", "bitter, provoking, cold",
     f"Close-up of {LAZ} {GAR}, {LR}, bitter half-smile", "LEFT")),
 ("c06", D8("c06"), S("c06", "Carolina", f"Close-up of {CAR} {GAR0}, {CL}, thoughtful and sincere, a touch of sadness", LAZ_B, "RIGHT", "sincere, thoughtful, sad",
     f"Close-up of {CAR} {GAR}, {CL}, thoughtful and sincere", "RIGHT")),
 ("c07", 6, S("c07", "Marcelo", f"Close-up of {MAR} {GAR0}, {ML}, frustrated, demanding an answer from his father", LAZ_B, "RIGHT", "frustrated, demanding, firm",
     f"Close-up of {MAR} {GAR}, {ML}, frustrated, demanding", "RIGHT")),
 ("c08", 6, S("c08", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, he turns his face away toward the lagoon, jaw tight, refusing", MAR_B, "LEFT", "curt, closed, proud",
     f"Close-up of {LAZ} {GAR}, {LR}, turning his face away, refusing", "LEFT")),
 ("r1", 6, one(f"Medium shot of {EST} {GAR}, walking out from under the white arches on the RIGHT, she stops and stares at the young woman's face, a hand to her chest", "LEFT") + " No dialogue."),
 ("c09", 6, S("c09", "Estela", f"Close-up of {EST} {GAR0}, {ER}, softly, almost to herself, eyes fixed on the young woman, moved", CAR_B, "LEFT", "soft, moved, nostalgic",
     f"Close-up of {EST} {GAR}, {ER}, softly, moved", "LEFT")),
 ("c10", 6, S("c10", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, he turns sharply to his wife, an order, nervous under the anger", EST_B, "RIGHT", "sharp, commanding, nervous",
     f"Close-up of {LAZ} {GAR}, {LR}, turning sharply to his wife", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Estela", f"Close-up of {EST} {GAR0}, {ER}, calm and decided, she looks at her husband, then at the young woman, eyes wet", LAZ_B, "LEFT", "calm, decided, emotional",
     f"Close-up of {EST} {GAR}, {ER}, calm and decided, eyes wet", "LEFT")),
 ("r2", 6, one(f"Close-up of {LAZ} {GAR}, {LR}, frozen, his stern face collapses, he lowers his eyes, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r3", 6, f"Medium two-shot {GAR}: on the LEFT, {MAR} and {CAR} side by side, stunned, they slowly turn to look at each other, completely silent; only these two people. No dialogue."),
 # CTA con carisma (después del BLACK): Carolina a cámara
 ("c12", 10, talk("c12", "Carolina", f"Close-up from the chest up of {CAR} {GAR}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, pulls her white cardigan closed, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("indignant, hard, scornful", "indignant, hard"), ("bitter, provoking, cold", "dry, cold"), ("scornful", "annoyed"), ("collapses", "changes"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm late afternoon light in the garden of a hacienda by a lagoon in Nayarit, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda garden with royal palms by a lagoon in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LAZARO_UGALDE}", "a stern Mexican man in his sixties with a thick grey mustache, a white guayabera and a cream palm hat"),
         ("@{ESTELA_UGALDE}", "a Mexican woman around sixty with shoulder-length auburn wavy hair and a lilac blouse"),
         ("@{MARCELO_UGALDE}", "a Mexican man around thirty with short dark-brown side-parted hair in a light-blue shirt"),
         ("@{CAROLINA_BENAVIDES}", "a young Mexican woman with long straight black hair in a coral dress and white cardigan"),
         (" @{LOC_JARDINLAGUNILLAS}", "")]
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
