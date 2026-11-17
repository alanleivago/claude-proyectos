"""Genera los clips de pan-comala PARTE 1 (El Pan de Comala, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la abuela manda llamar al patrón -> plazo invertido -> giro familiar): en una panadería de Comala, Colima, Toño (35), hombre de don Horacio,
se niega a pagar el pan, se lo tira al suelo a Matilde (30) y le da plazo "antes de que cierre la feria"; la abuela Clemencia (78) manda llamar a Horacio (55): ella le dio de comer cuando
dormía en la plaza. Plazo invertido. Giro: Clemencia es la madre de Horacio; lo dejó en la iglesia cuando era muy joven.
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
# Geografía fija (panadería): Matilde y Clemencia a la IZQUIERDA (mostrador y horno); Toño y Horacio a la DERECHA (del lado de la puerta a la calle).
YARD0 = ("inside a traditional bakery in Comala, Colima @{LOC_PANADERIA} in the morning: a big wood-fired brick oven, wicker baskets full of Mexican sweet bread, a long wooden counter, "
         "white walls, an open door to a cobblestone street with white houses, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
BREAD = "a wicker basket full of Mexican sweet bread"
PHONE = "a smartphone"
MAT = ("@{MATILDE_RUELAS} (30-year-old Mexican woman, light-brown skin, curly black hair tied under a white bandana, a red t-shirt under a white baker's apron dusted with flour)")
CLE = ("@{CLEMENCIA_RUELAS} (78-year-old Mexican grandmother, small, brown wrinkled skin, short curly white hair, a navy-blue dress with small white flowers, a white apron)")
TON = ("@{TONO_BECERRA} (35-year-old Mexican man, stocky, light-brown skin, a short black beard, a plain black cap, a grey sleeveless hoodie, a gold chain)")
HOR = ("@{HORACIO_VALDEZ} (55-year-old Mexican man, tall, light-brown skin, slicked-back grey hair, grey stubble, a black suit with an open black shirt, a gold watch)")
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

# Bordes: Toño u Horacio le hablan a Matilde/Clemencia -> espalda LEFT; Matilde o Clemencia les hablan -> espalda RIGHT.
MAT_B = "@{MATILDE_RUELAS} seen from behind (curly black hair under a white bandana, red t-shirt, apron strings)"
CLE_B = "@{CLEMENCIA_RUELAS} seen from behind (short curly white hair, navy-blue dress with small white flowers, small)"
TON_B = "@{TONO_BECERRA} seen from behind (plain black cap, grey sleeveless hoodie, stocky)"
HOR_B = "@{HORACIO_VALDEZ} seen from behind (slicked-back grey hair, black suit jacket, tall)"
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

ML = "standing on the LEFT behind the wooden counter"                    # Matilde
CL = "standing on the LEFT beside the wood-fired oven"                   # Clemencia
TR = "standing on the RIGHT in front of the counter, chewing a piece of bread"   # Toño
HR = "standing on the RIGHT just inside the open door"                   # Horacio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Toño YA hablando, comiendo pan sin pagar frente al mostrador; Matilde de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Toño", f"Medium close-up of {TON} {YARD0}, {TR}, talking from the very first frame, arrogant, mouth half full", MAT_B, "LEFT", "arrogant, mocking, bossy",
     f"Medium close-up of {TON} {YARD}, {TR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Matilde", f"Close-up of {MAT} {YARD0}, {ML}, firm and tired, she puts both hands on the counter", TON_B, "RIGHT", "firm, tired, brave",
     f"Close-up of {MAT} {YARD}, {ML}, firm and tired", "RIGHT")),
 ("c03", 6, talk("c03", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, he stops chewing, a cold smile", "LEFT"), "cold, mocking")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold chain bracelet slowly tips {BREAD} off the wooden counter and the bread rolls across the floor; only the hand, the basket and the bread, no face. No dialogue."),
 ("r1", 6, f"Medium shot of {CLE} {YARD}, {CL}, already in place, she stops kneading by the oven and turns, serious and calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in a navy dress')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Clemencia", f"Close-up of {CLE} {YARD0}, {CL}, calm and firm, flour on her hands", TON_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {CLE} {YARD}, {CL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Toño", f"Close-up of {TON} {YARD0}, {TR}, he laughs once with contempt", CLE_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {TON} {YARD}, {TR}, he laughs once", "LEFT")),
 ("c06", 6, S("c06", "Clemencia", f"Close-up of {CLE} {YARD0}, {CL}, completely calm, a small knowing look", TON_B, "RIGHT", "calm, knowing, slow",
     f"Close-up of {CLE} {YARD}, {CL}, completely calm", "RIGHT")),
 ("c07", 6, talk("c07", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, holding {PHONE} to his ear, laughing, mocking", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two black SUVs stopping slowly on a cobblestone street with white houses and red clay tile roofs in Comala, Colima, a volcano far away, morning light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {HOR} {YARD}, {HR}, already standing in place, he slowly takes off his black hat and holds it against his chest, moved and respectful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black suit')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Horacio", f"Close-up of {HOR} {YARD0}, {HR}, holding his black hat, moved, his eyes shine, a small smile", CLE_B, "LEFT", "moved, warm, low",
     f"Close-up of {HOR} {YARD}, {HR}, holding his hat, moved", "LEFT")),
 ("c09", 6, talk("c09", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, he turns around, pale and surprised, he takes off his cap", "RIGHT"), "surprised, nervous")),
 ("c10", D8("c10"), talk("c10", "Horacio", one(f"Close-up of {HOR} {YARD}, {HR}, cold and serious, he looks at his man", "RIGHT"), "cold, serious, slow")),
 ("c11", 6, talk("c11", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, nervous, holding his cap in both hands", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Horacio", one(f"Close-up of {HOR} {YARD}, {HR}, he points slowly at the bread on the floor, cold and final", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {TON} {YARD}, kneeling on the bakery floor, he picks up the sweet bread piece by piece and puts it back in the wicker basket, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black cap')}. No dialogue."),
 ("c13", D8("c13"), S("c13", "Matilde", f"Close-up of {MAT} {YARD0}, {ML}, grateful and curious", HOR_B, "RIGHT", "grateful, curious, soft",
     f"Close-up of {MAT} {YARD}, {ML}, grateful and curious", "RIGHT")),
 ("c14", D8("c14"), (talk("c14", "Clemencia", two(f"{CLE} on the LEFT and {HOR} on the RIGHT, in profile facing each other beside the oven {YARD0}, framed from the waist up; "
     f"Clemencia steps closer and speaks low, her eyes shine, slightly closer to the camera and in sharper focus") + " " + MOUTH("Clemencia", "Horacio"), "low, emotional, slow"),
   talk("c14", "Clemencia", one(f"Close-up of {CLE} {YARD}, {CL}, low and emotional, her eyes shine", "RIGHT"), "low, emotional, slow"))),
 ("c15", D8("c15"), S("c15", "Horacio", f"Close-up of {HOR} {YARD0}, {HR}, confused, his voice soft", CLE_B, "LEFT", "confused, soft",
     f"Close-up of {HOR} {YARD}, {HR}, confused, his voice soft", "LEFT")),
 ("c16", D8("c16"), S("c16", "Clemencia", f"Close-up of {CLE} {YARD0}, {CL}, tears in her eyes, she holds his hand", HOR_B, "RIGHT", "emotional, broken, soft",
     f"Close-up of {CLE} {YARD}, {CL}, her eyes shine, emotional", "RIGHT")),
 ("r4", 6, one(f"Close-up of {HOR} {YARD}, {HR}, in silence, stunned, his eyes fill with tears, the hat slips in his hands", "LEFT") + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Matilde", one(f"Close-up of {MAT} {YARD}, {ML}, stunned, she covers her mouth with one hand then lowers it", "RIGHT"), "stunned, soft")),
 # CTA con carisma (después del BLACK): Horacio solo, a cámara
 ("c18", 10, talk("c18", "Horacio", f"Close-up from the chest up of {HOR} {YARD}, alone, holding his black hat, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, wipes one eye with his thumb, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small bittersweet half smile. Nobody else around.",
     "charismatic, emotional, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Al cabo usted ya ni para hornear sirve.", "Usted ya está muy cansada."), ("Te dejé en la iglesia cuando yo era muy joven.", "Te dejé en la iglesia porque no tenía nada."),
        ("tips", "moves"), ("rolls across the floor", "rests on the floor"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"),
        ("stunned", "surprised"), ("his eyes fill with tears", "his eyes shine"), ("tears in her eyes", "her eyes shine"), ("broken", "soft"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm morning light inside a traditional bakery with a wood-fired oven in Comala, Colima, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic Mexican bakery with baskets of sweet bread, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MATILDE_RUELAS}", "a Mexican woman around thirty with curly black hair under a white bandana and a white baker's apron"),
         ("@{CLEMENCIA_RUELAS}", "a small elderly Mexican woman with short curly white hair, a navy dress with white flowers and a white apron"),
         ("@{TONO_BECERRA}", "a stocky Mexican man in his thirties with a short beard, a black cap, a grey sleeveless hoodie and a gold chain"),
         ("@{HORACIO_VALDEZ}", "a tall Mexican man in his fifties with slicked-back grey hair and a black suit with an open black shirt"),
         (" @{LOC_PANADERIA}", "")]
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
