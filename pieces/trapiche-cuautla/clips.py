"""Genera los clips de trapiche-cuautla PARTE 1 (El Trapiche de Cuautla, VISTA) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #57 "La viuda del trapiche" [CAPO] (premisa nueva tipo patrona; Patronas y haciendas, época ~1910), cierre tipo 3 (palabra reveladora: "Hijo…"):
el hacendado vecino Adalberto (62) le propone a la viuda Fidelina (48) casarse para juntar las haciendas; ella le presenta a su nuevo administrador Elías (34), al que Adalberto
le cerró la puerta hace años. Elías pone sobre la mesa el reloj que su madre Dominga le dejó; Adalberto lo reconoce y lo llama "Hijo…".
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
# Geografía fija (portal de arcos): Fidelina a la IZQUIERDA; Adalberto a la DERECHA junto a la mesa; Elías entra por los arcos del fondo y se queda al CENTRO-IZQUIERDA junto a Fidelina.
ARC0 = ("under the covered stone arcade of an old sugarcane hacienda house in Morelos around 1910 @{LOC_TRAPICHECUAUTLA} in the warm afternoon: thick stone arches, a long table with a white tablecloth and a glass jug of agua fresca, "
        "potted ferns, green sugarcane fields, an old stone aqueduct and a brick mill chimney beyond the arches; period setting; no readable text, no signs, no logos")
ARC = ARC0 + "; nobody else in the background, no extras, nobody besides the person described"
FID = ("@{FIDELINA_VILLASENOR} (48-year-old Mexican woman, light-brown skin, black hair with a few grey strands in a tight bun with a tortoiseshell comb, proud dark eyes, a high-collared black lace blouse, a long dark-grey skirt, an ivory cameo brooch)")
ADA = ("@{ADALBERTO_LARREA} (62-year-old Mexican man, fair tanned skin, a neat grey goatee and grey hair, heavy eyelids, a white linen three-piece suit with a gold watch chain, a white straw panama hat)")
ELI = ("@{ELIAS_CERVERA} (34-year-old Mexican mestizo man, brown skin, wavy black hair, a thin black mustache, calm intense eyes, a cream cotton shirt with rolled sleeves, a brown wool vest)")
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

FID_B = "@{FIDELINA_VILLASENOR} seen from behind (tight black bun with a tortoiseshell comb, black lace blouse)"
ADA_B = "@{ADALBERTO_LARREA} seen from behind (white straw panama hat, white linen suit jacket)"
ELI_B = "@{ELIAS_CERVERA} seen from behind (wavy black hair, brown wool vest over a cream shirt)"
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

FL = "standing on the LEFT"
AR = "standing on the RIGHT next to the table"
EC = "standing in the CENTER-LEFT next to the widow"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def T(cid, who, other, desc, tone, one_desc, one_side):
    return (talk(cid, who, two(desc) + " " + MOUTH(who, other), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Adalberto YA hablando, Fidelina de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Adalberto", f"Medium close-up of {ADA} {ARC0}, {AR}, talking from the very first frame, smug and confident, one hand resting on the table", FID_B, "LEFT", "smug, confident, patronizing",
     f"Medium close-up of {ADA} {ARC}, {AR}, talking from the very first frame, smug", "LEFT")),
 ("c02", D8("c02"), S("c02", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, chin up, proud and cold, not blinking", ADA_B, "RIGHT", "proud, cold, firm",
     f"Close-up of {FID} {ARC}, {FL}, proud and cold", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, a condescending smile, tilting his head", FID_B, "LEFT", "condescending, smooth",
     f"Close-up of {ADA} {ARC}, {AR}, condescending smile", "LEFT")),
 ("c04", D8("c04"), S("c04", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, a small confident smile, she turns her head toward the arches behind her at the end", ADA_B, "RIGHT", "confident, calm, a little proud",
     f"Close-up of {FID} {ARC}, {FL}, confident smile", "RIGHT")),
 ("r1", 6, one(f"Medium shot of {ELI} {ARC}, he walks in slowly under the stone arches from the sugarcane fields and takes off his wide-brimmed straw hat, serious, eyes fixed ahead", "RIGHT") + " " + MUTE),
 ("c05", 6, S("c05", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, holding his straw hat, calm, a cold polite look", ADA_B, "RIGHT", "calm, cold, polite",
     f"Close-up of {ELI} {ARC}, {EC}, calm and cold, holding his hat", "RIGHT")),
 ("r2", 6, one(f"Close-up of {ADA} {ARC}, {AR}, his smile vanishes, the glass of agua fresca stops halfway to his mouth, his face goes pale", "LEFT") + " Slow push-in. " + MUTE),
 ("c06", 6, S("c06", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, he puts the glass down hard, tense, looking at the widow", FID_B, "LEFT", "tense, alarmed, low",
     f"Close-up of {ADA} {ARC}, {AR}, tense, alarmed", "LEFT")),
 ("c07", D8("c07"), T("c07", "Fidelina", "Elías", f"{FID} {FL} and {ELI} {EC} {ARC0}, side by side, she speaks proudly toward the man off-screen on the right while Elias stands calm beside her", "proud, calm, firm",
     f"Close-up of {FID} {ARC}, {FL}, proud", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, scornful, pointing with his chin at the younger man", FID_B, "LEFT", "scornful, hard",
     f"Close-up of {ADA} {ARC}, {AR}, scornful", "LEFT")),
 ("c09", D8("c09"), S("c09", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, steady and controlled, a bitter look", ADA_B, "RIGHT", "steady, bitter, controlled",
     f"Close-up of {ELI} {ARC}, {EC}, steady and bitter", "RIGHT")),
 ("c10", 6, T("c10", "Fidelina", "Elías", f"{FID} and {ELI} {ARC0}, she turns to face him, surprised and hurt, he lowers his eyes", "surprised, soft, hurt",
     f"Close-up of {FID} {ARC}, {FL}, surprised and hurt", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, sad, a quiet voice, eyes shining", FID_B, "LEFT", "sad, quiet, tender",
     f"Close-up of {ELI} {ARC}, {EC}, sad, eyes shining", "LEFT")),
 ("c12", D8("c12"), S("c12", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, angry and nervous, sweating, raising one hand to stop him", ELI_B, "LEFT", "angry, nervous, loud",
     f"Close-up of {ADA} {ARC}, {AR}, angry and nervous", "LEFT")),
 ("c13", D8("c13"), S("c13", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, sharp and calm, looking down at his hand, then into his eyes", ADA_B, "RIGHT", "sharp, calm, probing",
     f"Close-up of {FID} {ARC}, {FL}, sharp and calm", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, cold and threatening, leaning forward over the table", FID_B, "LEFT", "cold, threatening, low",
     f"Close-up of {ADA} {ARC}, {AR}, cold and threatening", "LEFT")),
 ("c15", 6, S("c15", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, unmoved, pointing at a chair with one open hand, commanding", ADA_B, "RIGHT", "commanding, cold, steady",
     f"Close-up of {FID} {ARC}, {FL}, commanding", "RIGHT")),
 ("i01", 6, f"Close-up insert {ARC0}: a man's brown hand slowly places an old engraved silver pocket watch on the white tablecloth next to a glass of agua fresca; no readable text. No dialogue."),
 ("c16", D8("c16"), S("c16", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, his hand still near the silver pocket watch on the table, looking straight at the older man", ADA_B, "RIGHT", "calm, heavy, deliberate",
     f"Close-up of {ELI} {ARC}, {EC}, calm and heavy", "RIGHT")),
 ("r3", 6, one(f"Close-up of {ADA} {ARC}, {AR}, staring down at something on the table, pale, his hand trembling as he reaches out slowly", "LEFT") + " Slow push-in. " + MUTE),
 ("c17", D8("c17"), S("c17", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, holding an old silver pocket watch in his trembling hand, broken, almost whispering, eyes wet", ELI_B, "LEFT", "broken, whispering, moved",
     f"Close-up of {ADA} {ARC}, {AR}, holding a silver pocket watch, broken", "LEFT")),
 ("c18", 6, S("c18", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, firm, holding back emotion", ADA_B, "RIGHT", "firm, emotional, steady",
     f"Close-up of {ELI} {ARC}, {EC}, firm, holding back emotion", "RIGHT")),
 ("c19", 6, S("c19", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, he slowly raises his wet eyes to the younger man, a long pause before speaking, his voice breaking", ELI_B, "LEFT", "broken, slow, trembling",
     f"Close-up of {ADA} {ARC}, {AR}, wet eyes, voice breaking", "LEFT")),
 ("r4", 6, one(f"Close-up of {FID} {ARC}, {FL}, her eyes go wide, she slowly raises one hand to her lips, shocked and silent", "RIGHT") + " Slow push-in. " + MUTE),
 # CTA con carisma (después del BLACK): Fidelina a cámara
 ("c20", 10, talk("c20", "Fidelina", f"Close-up from the chest up of {FID} {ARC}, alone under the arches, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, touches her cameo brooch, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("cold, threatening, low", "cold, serious, low"), ("angry, nervous, loud", "nervous, loud"), ("threatening", "serious"),
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
          "Vertical scene from a Mexican period TV drama around 1910, realistic, warm afternoon light under the stone arches of a sugarcane hacienda, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical period drama shot, Mexican hacienda arcade with sugarcane fields behind, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican period drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FIDELINA_VILLASENOR}", "a Mexican woman in her late forties with a tight black bun, a high-collared black lace blouse and a cameo brooch"),
         ("@{ADALBERTO_LARREA}", "an older Mexican man with a grey goatee, a white linen suit and a white panama hat"),
         ("@{ELIAS_CERVERA}", "a Mexican man in his thirties with wavy black hair, a thin mustache, a cream shirt and a brown vest"),
         (" @{LOC_TRAPICHECUAUTLA}", "")]
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
