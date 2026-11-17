"""Genera los clips de red-janitzio PARTE 1 (La Red de Janitzio, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que el villano no cree -> llega la figura de poder -> plazo invertido -> giro familiar): en el muelle frente a Janitzio, Ignacio (38),
que maneja la cooperativa, le quita su lugar al viejo pescador don Severo (78), le avienta al agua la red que tejió su esposa y le da plazo "antes de que salgan las canoas"; su nieta Nayeli (25)
lo defiende. Severo hace una llamada: llega el gobernador (50), al que sacó del lago de niño. Plazo invertido. Giro: al niño lo aventaron al agua... el papá de Ignacio, su tío.
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
# Geografía fija (muelle): Severo y Nayeli a la IZQUIERDA (junto a su canoa y sus redes); Ignacio y el gobernador a la DERECHA (del lado de la orilla).
YARD0 = ("on a wooden fishermen's dock on Lake Pátzcuaro, Michoacán @{LOC_MUELLEJANITZIO} in the cold misty morning: small wooden canoes tied along the dock, piles of fishing nets, "
         "the island of Janitzio in the distance across the calm lake, soft grey light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
NET = "an old hand-woven fishing net"
PHONE = "an old small flip phone"
SEV = ("@{SEVERO_TZINTZUN} (78-year-old Purépecha Mexican fisherman, thin, dark-brown deeply wrinkled skin, short white hair, a woven palm hat, a faded white cotton shirt)")
NAY = ("@{NAYELI_TZINTZUN} (25-year-old Mexican woman, brown skin, long straight black hair in a ponytail, a beige trench coat over a black t-shirt)")
IGN = ("@{IGNACIO_BARRAGAN} (38-year-old Mexican man, light-brown skin, gelled black hair, a thin mustache, a blue windbreaker jacket over a white polo shirt, holding a clipboard)")
GOB = ("@{GOBERNADOR_ARREOLA} (50-year-old tall Mexican man, light-brown skin, neat black hair with grey temples, clean-shaven, a dark navy suit with a white shirt and no tie)")
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

# Bordes: Ignacio o el gobernador le hablan a Severo/Nayeli -> espalda LEFT; Severo o Nayeli les hablan -> espalda RIGHT.
SEV_B = "@{SEVERO_TZINTZUN} seen from behind (woven palm hat, faded white cotton shirt, thin)"
NAY_B = "@{NAYELI_TZINTZUN} seen from behind (long black ponytail, beige trench coat)"
IGN_B = "@{IGNACIO_BARRAGAN} seen from behind (gelled black hair, blue windbreaker jacket)"
GOB_B = "@{GOBERNADOR_ARREOLA} seen from behind (neat black hair with grey at the sides, dark navy suit jacket, tall)"
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

SL = f"standing on the LEFT on the dock beside his wooden canoe and {NET}"     # Severo
NL = "standing on the LEFT on the dock"                                        # Nayeli
IR = "standing on the RIGHT on the dock, on the shore side"                    # Ignacio
GR = "standing on the RIGHT at the end of the dock, on the shore side"         # Gobernador

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ignacio YA hablando con su tabla en la mano; Severo de espaldas (LEFT). Plazo: antes de que salgan las canoas.
 ("c01", D8("c01"), S("c01", "Ignacio", f"Medium close-up of {IGN} {YARD0}, {IR}, talking from the very first frame, arrogant, tapping the clipboard", SEV_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {IGN} {YARD}, {IR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Severo", f"Close-up of {SEV} {YARD0}, {SL}, calm and proud, his voice slow", IGN_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {SEV} {YARD}, {SL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, a cold smile, he spreads his hands", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {NAY} {YARD}, {NL}, already in place, she puts down a bag and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman in a beige trench coat')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Nayeli", f"Close-up of {NAY} {YARD0}, {NL}, firm, protective", IGN_B, "RIGHT", "firm, protective",
     f"Close-up of {NAY} {YARD}, {NL}, firm, protective", "RIGHT")),
 ("c05", 6, S("c05", "Ignacio", f"Close-up of {IGN} {YARD0}, {IR}, contemptuous, he waves her off", NAY_B, "LEFT", "contemptuous, mocking",
     f"Close-up of {IGN} {YARD}, {IR}, contemptuous", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a man's foot in khaki trousers slowly pushes {NET} off the edge of the wooden dock and it sinks slowly into the calm grey water; only the foot, the net and the water, no face. No dialogue."),
 ("c06", 6, S("c06", "Severo", f"Close-up of {SEV} {YARD0}, {SL}, his eyes shine, hurt but dignified, he looks at the water", IGN_B, "RIGHT", "hurt, dignified, slow",
     f"Close-up of {SEV} {YARD}, {SL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("c08", 6, (talk("c08", "Severo", two(f"{SEV} on the LEFT and {NAY} on the RIGHT, close together on the dock {YARD0}, framed from the waist up; "
     f"Severo speaks calmly to his granddaughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Severo", "Nayeli"), "calm, firm, low"),
   talk("c08", "Severo", one(f"Close-up of {SEV} {YARD}, {SL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two black SUVs arriving slowly along a lakeside road by Lake Pátzcuaro, Michoacán, in the misty morning, the island of Janitzio in the distance; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {GOB} {YARD}, {GR}, already standing in place, he walks slowly onto the dock with a serious and powerful look, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy suit')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Gobernador", f"Close-up of {GOB} {YARD0}, {GR}, respectful and warm, he bows his head slightly to the old man", SEV_B, "LEFT", "respectful, warm",
     f"Close-up of {GOB} {YARD}, {GR}, respectful and warm", "LEFT")),
 ("c11", 6, talk("c11", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, his smile gone, pale, he lowers the clipboard", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Gobernador", one(f"Close-up of {GOB} {YARD}, {GR}, cold and serious, he looks at Ignacio", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Gobernador", one(f"Close-up of {GOB} {YARD}, {GR}, he points at the water, cold and final", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {IGN} {YARD}, kneeling at the edge of the dock, he pulls the wet fishing net out of the lake with both hands, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a blue windbreaker')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Nayeli", f"Close-up of {NAY} {YARD0}, {NL}, grateful, a small smile", GOB_B, "RIGHT", "grateful, warm",
     f"Close-up of {NAY} {YARD}, {NL}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Severo", f"Close-up of {SEV} {YARD0}, {SL}, very serious, a memory in his eyes", GOB_B, "RIGHT", "serious, low, slow",
     f"Close-up of {SEV} {YARD}, {SL}, very serious", "RIGHT")),
 ("c16", D8("c16"), talk("c16", "Gobernador", one(f"Close-up of {GOB} {YARD}, {GR}, shocked, his voice low", "LEFT"), "shocked, low")),
 ("c17", 6, talk("c17", "Severo", one(f"Close-up of {SEV} {YARD}, {SL}, he slowly turns his eyes to Ignacio, grave", "RIGHT"), "grave, slow, low")),
 # CTA con carisma (después del BLACK): Severo solo, a cámara
 ("c18", 10, talk("c18", "Severo", f"Close-up from the chest up of {SEV} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts his palm hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small wise half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("A ese niño lo aventaron al agua.", "A ese niño alguien lo dejó en el agua."), ("¿Quién me aventó, don Severo?", "¿Quién me dejó en el agua, don Severo?"),
        ("¿Ustedes perdonarían a la familia que los quiso ahogar?", "¿Ustedes perdonarían algo así a su familia?"), ("Y tú le tiras su red al agua.", "Y tú le maltratas su red."),
        ("pushes", "moves"), ("sinks slowly into the calm grey water", "rests in the water"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("shocked", "surprised"),
        ("powerful", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, cold misty morning on a fishermen's dock on Lake Pátzcuaro, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, wooden dock with canoes and nets on a misty Mexican lake, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERO_TZINTZUN}", "a thin very old indigenous Mexican fisherman with white hair, a woven palm hat and a faded white shirt"),
         ("@{NAYELI_TZINTZUN}", "a Mexican woman in her twenties with a long black ponytail and a beige trench coat"),
         ("@{IGNACIO_BARRAGAN}", "a Mexican man in his late thirties with gelled black hair, a thin mustache and a blue windbreaker"),
         ("@{GOBERNADOR_ARREOLA}", "a tall Mexican man around fifty with grey temples and a dark navy suit without tie"),
         (" @{LOC_MUELLEJANITZIO}", "")]
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
