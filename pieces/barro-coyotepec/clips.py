"""Genera los clips de barro-coyotepec PARTE 1 (El Barro de Coyotepec, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado, sin niños (humillación + plazo -> la llamada que el villano no cree -> llega el poderoso agradecido -> plazo invertido -> giro familiar): en San Bartolo Coyotepec, Oaxaca,
el licenciado Efrén (36) quiere quitarle el taller de barro negro a doña Fidela (72), le rompe un cántaro de la mayordomía y le da plazo "antes de que empiece la Guelaguetza"; su sobrino
Rogelio (30) la defiende. Fidela llama a don Matías (58), su antiguo aprendiz, hoy jefe de Efrén. Plazo invertido. Giro: el que le quemó el taller hace treinta años fue el padre de Matías.
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
# Geografía fija (patio del taller): Fidela y Rogelio a la IZQUIERDA (repisas y horno); Efrén y Matías a la DERECHA (del lado del portón).
YARD0 = ("in the patio of a family black clay pottery workshop in San Bartolo Coyotepec, Oaxaca @{LOC_TALLERBARRO} in the afternoon: shelves full of shiny black clay pots and jars, "
         "an underground brick kiln with smoke, adobe walls, agave plants, a low gate to a dirt road, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
JAR = "a large shiny black clay jar"
PHONE = "an old small flip phone"
FID = ("@{FIDELA_PEDRO} (72-year-old Zapotec Mexican woman, small, dark-brown wrinkled skin, grey hair in two braids with dark ribbons, a dark-blue embroidered huipil, a grey rebozo)")
ROG = ("@{ROGELIO_PEDRO} (30-year-old Zapotec Mexican man, brown skin, short black hair, light stubble, a plain grey t-shirt, a clay-stained canvas apron)")
EFR = ("@{EFREN_MATUS} (36-year-old Mexican man, light-brown skin, gelled black hair, rectangular glasses, a thin mustache, a light-blue dress shirt with a dark tie, holding a black folder)")
MAT = ("@{MATIAS_LUIS} (58-year-old tall Mexican man, brown skin, short grey hair, a neat grey beard, a cream guayabera, a gold watch)")
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

# Bordes: Efrén o Matías le hablan a Fidela/Rogelio -> espalda LEFT; Fidela o Rogelio les hablan -> espalda RIGHT.
FID_B = "@{FIDELA_PEDRO} seen from behind (grey hair in two braids with dark ribbons, grey rebozo over a dark-blue huipil, small)"
ROG_B = "@{ROGELIO_PEDRO} seen from behind (short black hair, grey t-shirt, apron strings)"
EFR_B = "@{EFREN_MATUS} seen from behind (gelled black hair, light-blue dress shirt)"
MAT_B = "@{MATIAS_LUIS} seen from behind (short grey hair, cream guayabera, tall)"
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

FL = f"standing on the LEFT beside shelves of black clay pots"            # Fidela
RL = "standing on the LEFT near the brick kiln"                            # Rogelio
ER = "standing on the RIGHT just inside the low gate of the patio"         # Efrén
MR = "standing on the RIGHT at the low gate of the patio"                  # Matías

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Efrén YA hablando con su carpeta; Fidela de espaldas (LEFT) junto a sus repisas.
 ("c01", D8("c01"), S("c01", "Efrén", f"Medium close-up of {EFR} {YARD0}, {ER}, talking from the very first frame, arrogant and cold, he taps his folder", FID_B, "LEFT", "arrogant, cold, bossy",
     f"Medium close-up of {EFR} {YARD}, {ER}, talking from the very first frame, arrogant and cold", "LEFT")),
 ("c02", D8("c02"), S("c02", "Fidela", f"Close-up of {FID} {YARD0}, {FL}, calm and proud, clay on her hands", EFR_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {FID} {YARD}, {FL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, a mocking smile, he adjusts his glasses", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {ROG} {YARD}, {RL}, already in place, he puts down a clay jar and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey t-shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Rogelio", f"Close-up of {ROG} {YARD0}, {RL}, firm and protective", EFR_B, "RIGHT", "firm, protective",
     f"Close-up of {ROG} {YARD}, {RL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Efrén", f"Close-up of {EFR} {YARD0}, {ER}, dismissive, he waves him off", ROG_B, "LEFT", "dismissive, cold",
     f"Close-up of {EFR} {YARD}, {ER}, dismissive", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: the corner of a black folder knocks {JAR} off a low wooden shelf and it lands on the dirt floor in pieces; only the folder, the shelf and the clay, no face. No dialogue."),
 ("c06", 6, S("c06", "Fidela", f"Close-up of {FID} {YARD0}, {FL}, her eyes shine, she looks down at the broken clay, dignified", EFR_B, "RIGHT", "hurt, dignified",
     f"Close-up of {FID} {YARD}, {FL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {FID} {YARD}, she slowly kneels and gathers the black clay pieces into her rebozo, dignified, "
           f"{SOLO}; {ALONE}; {NODOUBLE('elderly woman in a huipil')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Fidela", two(f"{FID} on the LEFT holding broken clay in her rebozo and {ROG} on the RIGHT, close together near the kiln {YARD0}, framed from the waist up; "
     f"Fidela speaks calmly to her nephew, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fidela", "Rogelio"), "calm, firm, low"),
   talk("c08", "Fidela", one(f"Close-up of {FID} {YARD}, {FL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly on a dirt road between adobe houses and agave plants in San Bartolo Coyotepec, Oaxaca, warm afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {MAT} {YARD}, {MR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream guayabera')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Matías", f"Close-up of {MAT} {YARD0}, {MR}, warm and respectful, he bows his head slightly", FID_B, "LEFT", "warm, respectful",
     f"Close-up of {MAT} {YARD}, {MR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Matías", one(f"Close-up of {MAT} {YARD}, {MR}, serious, he looks at Efrén", "RIGHT"), "serious, firm, slow")),
 ("c13", D8("c13"), talk("c13", "Matías", one(f"Close-up of {MAT} {YARD}, {MR}, he points at the broken clay, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {EFR} {YARD}, kneeling on the dirt floor in his shirt and tie, he picks up pieces of black clay one by one, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a light-blue shirt')}. No dialogue."),
 ("c14", 6, S("c14", "Fidela", f"Close-up of {FID} {YARD0}, {FL}, moved, a small smile", MAT_B, "RIGHT", "moved, warm",
     f"Close-up of {FID} {YARD}, {FL}, moved", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Matías", f"Close-up of {MAT} {YARD0}, {MR}, serious, his eyes shine, guilty", FID_B, "LEFT", "serious, low, guilty",
     f"Close-up of {MAT} {YARD}, {MR}, serious, his eyes shine", "LEFT")),
 ("c16", 6, talk("c16", "Fidela", one(f"Close-up of {FID} {YARD}, {FL}, worried, she holds her rebozo", "RIGHT"), "worried, soft")),
 ("c17", 6, (talk("c17", "Matías", two(f"{FID} on the LEFT and {MAT} on the RIGHT, facing each other in the patio {YARD0}, framed from the waist up; "
     f"Matías speaks low, ashamed, slightly closer to the camera and in sharper focus") + " " + MOUTH("Matías", "Fidela"), "low, ashamed, slow"),
   talk("c17", "Matías", one(f"Close-up of {MAT} {YARD}, {MR}, low and ashamed", "LEFT"), "low, ashamed, slow"))),
 # CTA con carisma (después del BLACK): Fidela sola, a cámara
 ("c18", 10, talk("c18", "Fidela", f"Close-up from the chest up of {FID} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts her rebozo on her shoulders, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small wise half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("El hombre que le incendió el taller hace treinta años.", "El hombre que le destruyó el taller hace treinta años."),
        ("¿Ustedes perdonarían al hijo de quien les quemó todo?", "¿Ustedes perdonarían al hijo de quien les quitó todo?"), ("Al cabo tierra le sobra.", "Usted sabe cómo."),
        ("knocks", "moves"), ("lands on the dirt floor in pieces", "rests on the dirt floor"), ("broken", "fallen"), ("humiliated", "quiet"), ("powerful", "serious"), ("guilty", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in the patio of a black clay pottery workshop in Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic pottery patio with shiny black clay jars in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FIDELA_PEDRO}", "a small elderly indigenous Mexican woman with grey braids, a dark-blue embroidered huipil and a grey rebozo"),
         ("@{ROGELIO_PEDRO}", "a Mexican man around thirty with short black hair, a grey t-shirt and a clay-stained apron"),
         ("@{EFREN_MATUS}", "a Mexican man in his thirties with gelled hair, rectangular glasses, a light-blue shirt and a dark tie"),
         ("@{MATIAS_LUIS}", "a tall Mexican man in his late fifties with a neat grey beard and a cream guayabera"),
         (" @{LOC_TALLERBARRO}", "")]
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
