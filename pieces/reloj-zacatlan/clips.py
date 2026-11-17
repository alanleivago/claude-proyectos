"""Genera los clips de reloj-zacatlan PARTE 1 (El Reloj de Zacatlán, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en una relojería de Zacatlán, Puebla, Gisela (44) tiene a su hijastra Marisol (25) componiendo relojes toda la noche; Ernesto (58) llega antes,
encuentra en el suelo el reloj cucú que hizo su difunta Leonor y la corre "antes de que den las doce". Giro: el contrato del reloj de la parroquia se lo dio el primo de Gisela;
si la corre, se lo quitan. Es ella o el reloj.
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
# Geografía fija (relojería): de izquierda a derecha Marisol (en la mesa de trabajo), Ernesto (de pie en medio, entra por la puerta), Gisela (sentada en el banco del mostrador; desde c05 de pie).
YARD0 = ("inside a small family clock shop in Zacatlán de las Manzanas, Puebla @{LOC_RELOJERIA} on a foggy morning: walls covered with wooden wall clocks, cuckoo clocks and grandfather clocks, "
         "a wooden workbench with tiny gears and a magnifying lamp, a glass counter, a window to a foggy cobblestone street, warm lamp light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CUCKOO = "a broken hand-carved wooden cuckoo clock"
MAR = ("@{MARISOL_TELLEZ} (25-year-old Mexican woman, light-brown skin, dark-brown hair in a ponytail, a mustard-yellow cardigan over a white blouse, a brown leather work apron)")
ERN = ("@{ERNESTO_TELLEZ} (58-year-old Mexican man, light-brown skin, short grey hair, a short grey beard, a dark-green wool jacket over a red-and-grey checked flannel shirt)")
GIS = ("@{GISELA_RAMOS} (44-year-old Mexican woman, light skin, curly dyed red hair, heavy makeup, long red nails, gold bangles, a tight purple dress)")
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

# Bordes: orden fijo M - E - G. Gisela o Ernesto le hablan a Marisol -> espalda de ella LEFT; Marisol le habla a Ernesto o Gisela -> espalda RIGHT;
# Ernesto le habla a Gisela -> espalda de ella RIGHT; Gisela le habla a Ernesto -> espalda de él LEFT.
MAR_B = "@{MARISOL_TELLEZ} seen from behind (dark-brown ponytail, mustard-yellow cardigan, apron strings)"
ERN_B = "@{ERNESTO_TELLEZ} seen from behind (short grey hair, dark-green wool jacket)"
GIS_B = "@{GISELA_RAMOS} seen from behind (curly dyed red hair, tight purple dress)"
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

ML = "sitting on the LEFT at the wooden workbench, repairing a small clock under a magnifying lamp"   # Marisol
MS = "standing on the LEFT beside the workbench"                                                     # Marisol de pie
EC = "standing in the middle of the clock shop"                                                      # Ernesto
GS = "sitting on a stool on the RIGHT behind the glass counter, filing her nails"                    # Gisela sentada
GR = "standing on the RIGHT beside the glass counter"                                                # Gisela de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Gisela YA hablando desde el mostrador limándose las uñas; Marisol de espaldas (LEFT). Plazo: antes de que den las doce.
 ("c01", D8("c01"), S("c01", "Gisela", f"Medium close-up of {GIS} {YARD0}, {GS}, talking from the very first frame, bossy, she does not even look up from her nails", MAR_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {GIS} {YARD}, {GS}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Marisol", one(f"Close-up of {MAR} {YARD}, {ML}, tired, red eyes, she raises her head from the clock", "RIGHT"), "tired, firm")),
 ("c03", 6, S("c03", "Gisela", f"Close-up of {GIS} {YARD0}, {GS}, a lazy smile, she blows on her nails", MAR_B, "LEFT", "lazy, mocking",
     f"Close-up of {GIS} {YARD}, {GS}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {ERN} {YARD}, standing in the open front door of the shop, already in place, holding a wooden toolbox, fog behind him, he stops and looks around, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green wool jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled")),
 ("c05", 6, S("c05", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, she has just jumped up from the stool, a big nervous smile, she hides the nail file", ERN_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {GIS} {YARD}, {GR}, a big nervous smile", "LEFT")),
 ("c06", 6, S("c06", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, a shy tired smile", ERN_B, "RIGHT", "soft, shy, tired",
     f"Close-up of {MAR} {YARD}, {ML}, a shy tired smile", "RIGHT")),
 ("c07", 6, (talk("c07", "Ernesto", two(f"{MAR} sitting on the LEFT at the workbench and {ERN} standing on the RIGHT beside her, gently lifting her chin to look at her tired eyes {YARD0}, "
     f"framed from the waist up; Ernesto, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ernesto", "Marisol"), "worried, tender, low"),
   talk("c07", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, worried and tender, looking down", "LEFT"), "worried, tender, low"))),
 ("c08", 6, talk("c08", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, she waves one hand with a fake laugh", "LEFT"), "dismissive, fake, light")),
 ("r2", 6, one(f"Close-up of {ERN} {YARD}, {EC}, in silence, he looks down and sees {CUCKOO} lying on the wooden floor, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Ernesto", f"Close-up of {ERN} {YARD0}, {EC}, holding {CUCKOO} in his hands, serious, his voice low", GIS_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {ERN} {YARD}, {EC}, holding {CUCKOO}, serious", "RIGHT")),
 ("c10", 6, S("c10", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, she shrugs, looking at her red nails", ERN_B, "LEFT", "cool, careless",
     f"Close-up of {GIS} {YARD}, {GR}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {MAR} {YARD}, {ML}, in silence, she puts down her tweezers, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, her eyes shine, her voice breaks a little", GIS_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {MAR} {YARD}, {ML}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Ernesto", f"Close-up of {ERN} {YARD0}, {EC}, holding {CUCKOO}, cold and serious", GIS_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {ERN} {YARD}, {EC}, holding {CUCKOO}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, she rolls her eyes and crosses her arms", "LEFT"), "careless, cold, mocking")),
 ("c14", D8("c14"), talk("c14", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm, slow")),
 ("c15", 6, S("c15", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, defiant, her chin up", ERN_B, "LEFT", "defiant, mocking",
     f"Close-up of {GIS} {YARD}, {GR}, defiant, her chin up", "LEFT")),
 ("c16", D8("c16"), S("c16", "Ernesto", f"Close-up of {ERN} {YARD0}, {EC}, firm and calm, he points slowly at the clocks on the wall", GIS_B, "RIGHT", "firm, calm, final",
     f"Close-up of {ERN} {YARD}, {EC}, firm and calm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: several old clock faces on the wooden wall, their hands almost at twelve, brass pendulums swinging slowly in the warm lamp light; only the clocks, no people. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused, slow")),
 ("c18", 6, talk("c18", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, proud and firm", "RIGHT"), "proud, firm")),
 ("c19", D8("c19"), S("c19", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, she leans in slightly and smiles, enjoying it", ERN_B, "LEFT", "sly, low, slow",
     f"Close-up of {GIS} {YARD}, {GR}, she smiles, enjoying it", "LEFT")),
 ("r4", 6, one(f"Close-up of {ERN} {YARD}, {EC}, in silence, his firm face slowly fills with doubt, he looks down at the cuckoo clock in his hands", "RIGHT") + " Slow push-in. No dialogue."),
 ("c20", D8("c20"), S("c20", "Marisol", f"Close-up of {MAR} {YARD0}, {MS}, she stands up, brave and firm, her eyes shine", ERN_B, "RIGHT", "brave, firm, emotional",
     f"Close-up of {MAR} {YARD}, {MS}, brave and firm", "RIGHT")),
 ("c21", 6, (talk("c21", "Gisela", f"Medium wide group shot {YARD0}: {MAR} standing on the LEFT by the workbench, {ERN} in the middle holding the cuckoo clock, {GIS} standing on the RIGHT by the counter; "
     f"Gisela, sure of herself, speaks, closest to the camera and in sharp focus; only these three people, no extras. Only Gisela speaks: her lips move clearly; the other two stay silent with mouths closed.", "sly, calm, final"),
   talk("c21", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, sure of herself", "LEFT"), "sly, calm, final"))),
 # CTA con carisma (después del BLACK): Marisol sola, a cámara
 ("c22", 10, talk("c22", "Marisol", f"Close-up from the chest up of {MAR} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a loose strand of hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small hopeful half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si no, hoy no comes.", "Y sin pretextos."), ("¿Y qué vas a hacer, correrme?", "¿Y qué vas a hacer, sacarme?"), ("Usted lo tiró anoche, yo la vi.", "Usted lo descolgó anoche, yo la vi."),
        ("his face darkens", "he becomes serious"), ("enjoying it", "calm"), ("fake", "polite"), ("her voice breaks a little", "softly"), ("defiant", "confident"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm lamp light inside a small clock shop full of wall clocks on a foggy morning in Puebla, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, cozy old clock shop with cuckoo clocks and a workbench in a Mexican mountain town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MARISOL_TELLEZ}", "a Mexican woman in her twenties with a dark-brown ponytail, a mustard-yellow cardigan and a brown leather apron"),
         ("@{ERNESTO_TELLEZ}", "a Mexican man in his fifties with short grey hair, a grey beard and a dark-green wool jacket"),
         ("@{GISELA_RAMOS}", "a Mexican woman in her forties with curly dyed red hair, heavy makeup and a tight purple dress"),
         (" @{LOC_RELOJERIA}", "")]
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
