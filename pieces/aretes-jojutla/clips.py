"""Genera los clips de aretes-jojutla PARTE 1 (Los Aretes de Jojutla, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #47 "La matriarca y los tres capataces" [CAPO] (Patronas y haciendas), cierre tipo 7 (objeto que delata): en el corredor de su hacienda arrocera en Jojutla,
la temida matriarca Leonarda (67) interroga a Abel (33), que llegó con sus dos hermanos a pedir trabajo. Su hija Isadora (28) lo defiende. Abel cuenta que su hermana trabajó ahí
y dejó de escribirles; Leonarda dice no acordarse. Isadora se acomoda el pelo y Abel ve sus aretes de filigrana: "Esos aretes… yo se los regalé a Lucía".
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
# Geografía fija (corredor): Leonarda a la DERECHA junto a los arcos; Isadora a la DERECHA un paso detrás de su madre, junto a la banca; Abel a la IZQUIERDA, sombrero en mano.
COR0 = ("in the wide corridor of the main house of an old rice hacienda in Jojutla, Morelos @{LOC_HACIENDAJOJUTLA} in the bright mid-morning: thick ochre stone arches, red clay tile floor, potted ferns and bougainvillea, "
        "green rice fields and tall palm trees beyond the arches; no readable text, no signs, no logos")
COR = COR0 + "; nobody else in the background, no extras, nobody besides the person described"
LEO = ("@{LEONARDA_MONTOYA} (67-year-old Mexican woman, tanned skin, grey-streaked black hair in a thick braided crown, hard dark eyes, a dark-green dress with a black shawl, a small silver cross necklace)")
ISA = ("@{ISADORA_MONTOYA} (28-year-old Mexican woman, light-brown skin, long wavy black hair loose over one shoulder, soft brown eyes, a white linen blouse, long silver filigree teardrop earrings)")
ABE = ("@{ABEL_CORTES} (33-year-old Mexican man, dark-brown skin, short black hair, a thin black mustache, serious dark eyes, a faded denim work shirt with rolled sleeves, a straw cowboy hat in his hand)")
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

LEO_B = "@{LEONARDA_MONTOYA} seen from behind (grey-streaked black braided crown, black shawl over a dark-green dress)"
ISA_B = "@{ISADORA_MONTOYA} seen from behind (long wavy black hair, white linen blouse)"
ABE_B = "@{ABEL_CORTES} seen from behind (short black hair, faded denim work shirt)"
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

LR = "standing on the RIGHT by the stone arches"
IR = "standing on the RIGHT a step behind her mother, by the wooden bench"
AL = "standing on the LEFT, holding his straw cowboy hat in front of him"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Leonarda YA hablando, seca, Abel de espaldas en el borde.
 ("c01", 6, S("c01", "Leonarda", f"Medium close-up of {LEO} {COR0}, {LR}, talking from the very first frame, dry and hard, looking him up and down", ABE_B, "LEFT", "dry, hard, suspicious",
     f"Medium close-up of {LEO} {COR}, {LR}, talking from the very first frame, dry and hard", "LEFT")),
 ("c02", D8("c02"), S("c02", "Abel", f"Close-up of {ABE} {COR0}, {AL}, respectful but steady, holding her gaze", LEO_B, "RIGHT", "respectful, steady, serious",
     f"Close-up of {ABE} {COR}, {AL}, respectful but steady", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, eyes narrowing, a cold sideways look", ABE_B, "LEFT", "cold, distrustful, cutting",
     f"Close-up of {LEO} {COR}, {LR}, eyes narrowing", "LEFT")),
 ("c04", 6, S("c04", "Isadora", f"Close-up of {ISA} {COR0}, {IR}, stepping forward gently, a soft voice toward her mother", LEO_B, "RIGHT", "soft, gentle, persuasive",
     f"Close-up of {ISA} {COR}, {IR}, soft voice", "RIGHT")),
 ("c05", 6, S("c05", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, turning her head sharply to her daughter, stern", ISA_B, "LEFT", "stern, sharp, controlling",
     f"Close-up of {LEO} {COR}, {LR}, stern, turning her head sharply", "LEFT")),
 ("c06", D8("c06"), S("c06", "Abel", f"Close-up of {ABE} {COR0}, {AL}, quiet and serious, a short pause before the last words, his grip tightening on his hat", LEO_B, "RIGHT", "quiet, serious, heavy",
     f"Close-up of {ABE} {COR}, {AL}, quiet and serious", "RIGHT")),
 ("c07", 6, S("c07", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, a flicker of unease behind her hard face, she raises her chin", ABE_B, "LEFT", "guarded, curt, uneasy",
     f"Close-up of {LEO} {COR}, {LR}, guarded, chin raised", "LEFT")),
 ("c08", 6, S("c08", "Abel", f"Close-up of {ABE} {COR0}, {AL}, he looks straight at her, voice low and controlled, sadness in his eyes", LEO_B, "RIGHT", "low, controlled, sad",
     f"Close-up of {ABE} {COR}, {AL}, low and controlled, sad eyes", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, cold, too quick, she looks away toward the rice fields as she answers", ABE_B, "LEFT", "cold, quick, evasive",
     f"Close-up of {LEO} {COR}, {LR}, cold, looking away", "LEFT")),
 ("r1", 6, one(f"Medium close-up of {ISA} {COR}, {IR}, she tucks her long hair behind her ear with one hand, revealing a long silver filigree teardrop earring that catches the sunlight", "LEFT") + " No dialogue."),
 ("i01", 6, f"Extreme close-up insert {COR0}: a long silver filigree teardrop earring hanging from a young woman's ear, glinting in the sunlight, strands of wavy black hair; no full face, no readable text. No dialogue."),
 ("c10", 6, S("c10", "Abel", f"Close-up of {ABE} {COR0}, {AL}, frozen, staring at the young woman's earring, his voice barely a whisper, his eyes wet", ISA_B, "RIGHT", "whispering, shaken, stunned",
     f"Close-up of {ABE} {COR}, {AL}, frozen, whispering, eyes wet", "RIGHT")),
 ("r2", 6, one(f"Close-up of {LEO} {COR}, {LR}, completely still, her hard face goes pale, her hand slowly closes on her black shawl, her eyes locked on him", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Abel a cámara
 ("c11", 10, talk("c11", "Abel", f"Close-up from the chest up of {ABE} {COR}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, turns his straw hat slowly in his hands, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing look. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("whispering, shaken, stunned", "whispering, stunned"), ("cold, distrustful, cutting", "cold, distrustful"), ("goes pale", "changes"), ("shaken", "moved"),
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
          "Vertical scene from a Mexican TV drama, realistic, bright mid-morning light in the stone corridor of a rice hacienda in Morelos, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda corridor with stone arches and rice fields in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LEONARDA_MONTOYA}", "a stern Mexican woman in her late sixties with a grey-streaked black braided crown and a black shawl over a dark-green dress"),
         ("@{ISADORA_MONTOYA}", "a Mexican woman in her late twenties with long wavy black hair, a white linen blouse and long silver filigree earrings"),
         ("@{ABEL_CORTES}", "a Mexican man in his early thirties with a thin black mustache, a faded denim work shirt and a straw cowboy hat in his hand"),
         (" @{LOC_HACIENDAJOJUTLA}", "")]
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
