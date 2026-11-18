"""Genera los clips de relevo-ures PARTE 1 (El Relevo de Ures, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #24 "El hermano que volvió" [CAPO] (Traición familiar), cierre tipo 5 (la acusación se vuelve contra quien acusa): en la hacienda ganadera de Ures, Gustavo (46) ya se sienta en la silla
del padre muerto. Vuelve Lisardo (40) tras ocho años; Gustavo lo acusó de vender el ganado a escondidas. La madre Natividad (70) reconoce la letra del padre en la carta que trae Lisardo:
el padre escribió quién vendía el ganado, y no era Lisardo.
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
# Geografía fija (sala): Gustavo a la DERECHA junto al sillón de cuero bajo el retrato; Natividad a la DERECHA junto a la mesita con flores; Lisardo a la IZQUIERDA cerca de la ventana.
YARD0 = ("in the main living room of an old cattle hacienda in Ures, Sonora @{LOC_SALAURES} in the afternoon: thick white adobe walls, dark mesquite beams, a big leather armchair, "
         "a large framed oil portrait of an old rancher with a white mustache, a cowhide rug, a side table with white flowers and a lit candle, dusty golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
GUS = ("@{GUSTAVO_IBARRA} (46-year-old Mexican man, fair sunburned skin, thinning light-brown hair combed back, a thick brown mustache, a black western shirt with pearl snaps, a black leather vest, a black felt cowboy hat)")
LIS = ("@{LISARDO_IBARRA} (40-year-old Mexican man, tanned skin, short dark hair with some grey, short dark stubble, a dusty tan canvas jacket over a plain white t-shirt)")
NAT = ("@{NATIVIDAD_IBARRA} (70-year-old Mexican woman, light-brown skin, white hair in a neat low bun, a black mourning dress, a black lace shawl, a small gold cross necklace)")
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

GUS_B = "@{GUSTAVO_IBARRA} seen from behind (black felt cowboy hat, black leather vest over a black shirt)"
LIS_B = "@{LISARDO_IBARRA} seen from behind (short dark hair, dusty tan canvas jacket)"
NAT_B = "@{NATIVIDAD_IBARRA} seen from behind (white hair in a low bun, black lace shawl)"
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

GR = "on the RIGHT, seated in the big leather armchair under the portrait"
GRS = "standing on the RIGHT beside the big leather armchair"
NR = "standing on the RIGHT by the side table with white flowers"
LL = "standing on the LEFT near the tall window"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Gustavo YA hablando desde el sillón del padre, Lisardo de espaldas en el borde.
 ("c01", 6, S("c01", "Gustavo", f"Medium close-up of {GUS} {YARD0}, {GR}, talking from the very first frame, arrogant, his hands on the armrests", LIS_B, "LEFT", "arrogant, cold, superior",
     f"Medium close-up of {GUS} {YARD}, {GR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Lisardo", f"Close-up of {LIS} {YARD0}, {LL}, tired but firm, a bitter half smile", GUS_B, "RIGHT", "tired, bitter, firm",
     f"Close-up of {LIS} {YARD}, {LL}, tired but firm", "RIGHT")),
 ("c03", 6, S("c03", "Natividad", f"Close-up of {NAT} {YARD0}, {NR}, eyes full of tears, one hand on her gold cross, moved", LIS_B, "LEFT", "moved, tearful, soft",
     f"Close-up of {NAT} {YARD}, {NR}, eyes full of tears, moved", "LEFT")),
 ("c04", 6, S("c04", "Gustavo", f"Close-up of {GUS} {YARD0}, {GR}, contemptuous, talking to his mother without looking at his brother", NAT_B, "LEFT", "contemptuous, sarcastic",
     f"Close-up of {GUS} {YARD}, {GR}, contemptuous", "LEFT")),
 ("c05", D8("c05"), S("c05", "Lisardo", f"Close-up of {LIS} {YARD0}, {LL}, contained anger, his jaw tight, eyes fixed on his brother", GUS_B, "RIGHT", "contained, hurt, firm",
     f"Close-up of {LIS} {YARD}, {LL}, contained anger, eyes fixed ahead", "RIGHT")),
 ("c06", 6, S("c06", "Gustavo", f"Close-up of {GUS} {YARD0}, {GRS}, he stands up from the armchair slowly, proud, chin raised", LIS_B, "LEFT", "proud, smug, cold",
     f"Close-up of {GUS} {YARD}, {GRS}, proud, chin raised", "LEFT")),
 ("c07", D8("c07"), S("c07", "Natividad", f"Close-up of {NAT} {YARD0}, {NR}, sad and firm, looking at her elder son", GUS_B, "LEFT", "sad, firm, reproachful",
     f"Close-up of {NAT} {YARD}, {NR}, sad and firm", "LEFT")),
 ("c08", 6, S("c08", "Gustavo", f"Close-up of {GUS} {YARD0}, {GRS}, cold and impatient, he taps the armrest of the leather armchair", NAT_B, "LEFT", "cold, impatient, final",
     f"Close-up of {GUS} {YARD}, {GRS}, cold and impatient", "LEFT")),
 ("c09", 6, talk("c09", "Lisardo", two(f"{LIS} on the LEFT and {GUS} on the RIGHT {YARD0}, framed from the waist up; the younger brother slowly takes an old sealed envelope out of his canvas jacket and holds it up, "
     f"the elder brother stops smiling") + " " + MOUTH("Lisardo", "Gustavo"), "calm, cutting, slow")),
 ("i01", 6, f"Close-up insert {YARD0}: wrinkled old hands opening an old envelope with a broken dark-red wax seal and unfolding a handwritten letter in old ink; the handwriting is blurry and unreadable, only paper and hands, no faces. No dialogue."),
 ("c10", 6, talk("c10", "Natividad", one(f"Close-up of {NAT} {YARD}, {NR}, holding an old handwritten letter with trembling hands, her eyes wide, whispering", "LEFT"), "whispering, shocked, emotional")),
 ("c11", D8("c11"), S("c11", "Lisardo", f"Close-up of {LIS} {YARD0}, {LL}, calm and heavy, looking straight at his brother", GUS_B, "RIGHT", "calm, heavy, firm",
     f"Close-up of {LIS} {YARD}, {LL}, calm and heavy", "RIGHT")),
 ("r1", 6, one(f"Close-up of {GUS} {YARD}, {GRS}, frozen, his face goes pale, he swallows, his eyes drop to the floor, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r2", 6, one(f"Close-up of {NAT} {YARD}, {NR}, she slowly lowers the letter and turns her eyes toward her elder son, deeply disappointed, a tear rolls down, no words", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Lisardo a cámara
 ("c12", 10, talk("c12", "Lisardo", f"Close-up from the chest up of {LIS} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts the collar of his canvas jacket, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small tired smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous, sarcastic", "cool, ironic"), ("contemptuous", "cool"), ("arrogant", "proud"), ("contained anger", "tension"), ("bitter", "serious"),
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
          "Vertical scene from a Mexican TV drama, realistic, dusty golden afternoon light in the living room of an old cattle hacienda in Sonora, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old hacienda living room with adobe walls in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GUSTAVO_IBARRA}", "a Mexican rancher in his mid forties with a thick brown mustache, a black western shirt, a black leather vest and a black cowboy hat"),
         ("@{LISARDO_IBARRA}", "a Mexican man around forty with greying short dark hair, stubble and a dusty tan canvas jacket over a white t-shirt"),
         ("@{NATIVIDAD_IBARRA}", "an old Mexican woman with white hair in a low bun, a black mourning dress and a black lace shawl"),
         (" @{LOC_SALAURES}", "")]
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
