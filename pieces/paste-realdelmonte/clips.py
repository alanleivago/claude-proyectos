"""Genera los clips de paste-realdelmonte PARTE 1 (El Paste de Real del Monte, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en una pastería de Real del Monte, Hidalgo, Karla (40) tiene a su hijastra Daniela (23) amasando sola desde las cuatro mientras ella está en el sillón;
Rogelio (52) llega antes, ve el rodillo de su difunta Elvira en la basura y la corre "antes de que salga el turno de la mina".
Giro: Rogelio firmó sin saber y el local ya está a nombre de Karla.
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
# Geografía fija (pastería): de izquierda a derecha Daniela (en la mesa de amasar), Rogelio (de pie en medio, entra por la puerta), Karla (en el sillón de la salita; desde c05 de pie junto al sillón).
YARD0 = ("inside a small family paste bakery in Real del Monte, Hidalgo @{LOC_PASTERIA} on a cold foggy morning: a long wooden kneading table covered in flour, an old brick oven, a glass display case, "
         "a doorway to a small living room with a worn sofa, a window to a misty hillside town, warm lamp light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PIN = "an old carved wooden rolling pin"
PHONE = "a smartphone"
DAN = ("@{DANIELA_ROMERO} (23-year-old Mexican woman, light skin with rosy cheeks, brown hair in a messy bun, a grey wool sweater with rolled-up sleeves, a white apron dusted with flour)")
ROG = ("@{ROGELIO_ROMERO} (52-year-old Mexican man, stocky, light-brown skin, short black-and-grey hair, a black beard with grey, a dark-blue quilted work jacket, a grey knitted beanie)")
KAR = ("@{KARLA_MONTIEL} (40-year-old Mexican woman, light skin, wavy platinum-blonde dyed hair, long pink acrylic nails, a pink satin robe over pajamas)")
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

# Bordes: orden fijo D - R - K. Karla o Rogelio le hablan a Daniela -> espalda de ella LEFT; Daniela le habla a Rogelio o Karla -> espalda RIGHT;
# Rogelio le habla a Karla -> espalda de ella RIGHT; Karla le habla a Rogelio -> espalda de él LEFT.
DAN_B = "@{DANIELA_ROMERO} seen from behind (brown hair in a messy bun, grey wool sweater, white apron strings)"
ROG_B = "@{ROGELIO_ROMERO} seen from behind (grey knitted beanie, dark-blue quilted work jacket, stocky)"
KAR_B = "@{KARLA_MONTIEL} seen from behind (wavy platinum-blonde hair, pink satin robe)"
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

DL = "standing on the LEFT at the long wooden kneading table, her hands in the dough"      # Daniela
DS = "standing on the LEFT beside the kneading table"                                      # Daniela quieta
RC = "standing in the middle of the bakery"                                                # Rogelio
KS = f"lounging on a worn sofa on the RIGHT in the small living room, holding {PHONE}"      # Karla en el sillón
KR = "standing on the RIGHT beside the worn sofa"                                          # Karla de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Karla YA hablando desde el sillón con el celular; Daniela de espaldas (LEFT) amasando. Plazo: antes de que salga el turno de la mina.
 ("c01", D8("c01"), S("c01", "Karla", f"Medium close-up of {KAR} {YARD0}, {KS}, talking from the very first frame, bossy, she barely looks up from the phone", DAN_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {KAR} {YARD}, {KS}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Daniela", one(f"Close-up of {DAN} {YARD}, {DL}, tired but firm, flour on her cheek, she raises her eyes", "RIGHT"), "tired, firm")),
 ("c03", D8("c03"), S("c03", "Karla", f"Close-up of {KAR} {YARD0}, {KS}, a lazy smile, she scrolls the phone", DAN_B, "LEFT", "lazy, mocking",
     f"Close-up of {KAR} {YARD}, {KS}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {ROG} {YARD}, standing in the open front door of the bakery, already in place, cold fog behind him, he stops and slowly pulls off his beanie, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a blue work jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled")),
 ("c05", 6, S("c05", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, she has just jumped up from the sofa, a big nervous smile, she closes her robe", ROG_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {KAR} {YARD}, {KR}, a big nervous smile", "LEFT")),
 ("c06", 6, S("c06", "Daniela", f"Close-up of {DAN} {YARD0}, {DL}, a shy tired smile", ROG_B, "RIGHT", "soft, shy, tired",
     f"Close-up of {DAN} {YARD}, {DL}, a shy tired smile", "RIGHT")),
 ("c07", 6, (talk("c07", "Rogelio", two(f"{DAN} on the LEFT at the floury kneading table and {ROG} on the RIGHT beside her, gently brushing flour off her cheek with his thumb {YARD0}, "
     f"framed from the waist up; Rogelio, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rogelio", "Daniela"), "worried, tender, low"),
   talk("c07", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, worried and tender, looking down", "LEFT"), "worried, tender, low"))),
 ("c08", 6, talk("c08", "Karla", one(f"Close-up of {KAR} {YARD}, {KR}, she waves one hand with a fake laugh", "LEFT"), "dismissive, fake, light")),
 ("r2", 6, one(f"Close-up of {ROG} {YARD}, {RC}, in silence, he looks down into a trash bin and sees {PIN} inside, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Rogelio", f"Close-up of {ROG} {YARD0}, {RC}, serious, his voice low, he gestures toward the trash bin", KAR_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {ROG} {YARD}, {RC}, serious, his voice low", "RIGHT")),
 ("c10", 6, S("c10", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, she shrugs, looking at her long nails", ROG_B, "LEFT", "cool, careless",
     f"Close-up of {KAR} {YARD}, {KR}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {DAN} {YARD}, {DL}, in silence, she stops kneading, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Daniela", f"Close-up of {DAN} {YARD0}, {DL}, her eyes shine, her voice breaks a little", KAR_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {DAN} {YARD}, {DL}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Rogelio", f"Close-up of {ROG} {YARD0}, {RC}, holding {PIN} in both hands, cold and serious", KAR_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {ROG} {YARD}, {RC}, holding {PIN}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Karla", one(f"Close-up of {KAR} {YARD}, {KR}, she rolls her eyes and crosses her arms", "LEFT"), "careless, cold, mocking")),
 ("c14", D8("c14"), talk("c14", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm, slow")),
 ("c15", 6, S("c15", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, defiant, her chin up", ROG_B, "LEFT", "defiant, mocking",
     f"Close-up of {KAR} {YARD}, {KR}, defiant, her chin up", "LEFT")),
 ("c16", D8("c16"), S("c16", "Rogelio", f"Close-up of {ROG} {YARD0}, {RC}, firm and calm, he gestures slowly toward the front door", KAR_B, "RIGHT", "firm, calm, final",
     f"Close-up of {ROG} {YARD}, {RC}, firm and calm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: a metal tray of golden baked pastes steaming on the floury wooden table in the warm lamp light; only the pastes and the table, no people. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Karla", one(f"Close-up of {KAR} {YARD}, {KR}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused, slow")),
 ("c18", 6, talk("c18", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, firm, but a shadow of doubt in his eyes", "RIGHT"), "firm, uneasy")),
 ("c19", 6, S("c19", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, she leans in slightly and smiles, enjoying it", ROG_B, "LEFT", "sly, low, slow",
     f"Close-up of {KAR} {YARD}, {KR}, she smiles, enjoying it", "LEFT")),
 ("r4", 6, f"Medium shot of {DAN} {YARD}, {DS}, she slowly steps back from the table, surprised, her floury hands raised a little, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a grey sweater')}. Slow push-in. No dialogue."),
 ("c20", 6, talk("c20", "Daniela", one(f"Close-up of {DAN} {YARD}, {DS}, surprised and hurt, her voice small", "RIGHT"), "surprised, soft, hurt")),
 ("c21", 6, talk("c21", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, pale, his voice low, he looks at his daughter", "LEFT"), "low, ashamed, pleading")),
 ("c22", 6, S("c22", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, a cruel little smile, she looks at the daughter", DAN_B, "LEFT", "cruel, sweet, slow",
     f"Close-up of {KAR} {YARD}, {KR}, a little smile", "LEFT")),
 # CTA con carisma (después del BLACK): Daniela sola, a cámara
 ("c23", 10, talk("c23", "Daniela", f"Close-up from the chest up of {DAN} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, wipes flour off her cheek with the back of her hand, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Amasar no mata a nadie.", "Amasar no le hace daño a nadie."), ("¿Correrme por tu hijita?", "¿Sacarme por tu hija?"),
        ("No para que mi hija fuera tu sirvienta.", "No para que mi hija hiciera todo sola."), ("Te lo juro por tu madre.", "Créeme, mija."),
        ("a cruel little smile", "a little smile"), ("his face darkens", "he becomes serious"), ("enjoying it", "calm"), ("fake", "polite"),
        ("ashamed", "quiet"), ("her voice breaks a little", "softly"), ("trash bin", "corner"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm lamp light inside a small paste bakery on a cold foggy morning in Hidalgo, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, small rustic bakery with a floury wooden kneading table in a Mexican mountain town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{DANIELA_ROMERO}", "a Mexican woman in her twenties with brown hair in a messy bun, a grey sweater and a floury white apron"),
         ("@{ROGELIO_ROMERO}", "a stocky Mexican man in his fifties with a greying beard, a dark-blue quilted jacket and a grey beanie"),
         ("@{KARLA_MONTIEL}", "a Mexican woman in her forties with wavy platinum-blonde hair, long pink nails and a pink satin robe"),
         (" @{LOC_PASTERIA}", "")]
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
