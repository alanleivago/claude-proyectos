"""Genera los clips de ambar-simojovel PARTE 1 (El Ámbar de Simojovel, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en un taller de ámbar de Simojovel, Chiapas, Rosaura (45) tiene a su hijastra Itzel (24) puliendo sola desde las cinco mientras
ella está en la hamaca; Fidencio (55) regresa antes de la feria, descubre que vendió el ámbar de la libélula de su difunta Amalia y la corre "antes de que se meta el sol".
Giro: la compradora fue Amalia, que está viva en Comitán, y Fidencio siempre lo supo.
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
# Geografía fija (taller de ámbar, Simojovel): de izquierda a derecha Itzel (sentada en su banquito en la mesa de pulir), Fidencio (de pie junto a la mesa, entra por la puerta),
# Rosaura (en la hamaca del corredor; desde c05 de pie junto a la hamaca).
YARD0 = ("inside a rustic amber workshop in a wooden house in Simojovel, Chiapas @{LOC_TALLERAMBAR} during the day: a long wooden workbench with a small polishing wheel, "
         "trays of golden-orange amber pieces, a woven hammock on the porch side, an open door to green misty hills, warm window light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
AMBER = "a small piece of golden amber"
PHONE = "a smartphone"
ITZ = ("@{ITZEL_GORDILLO} (24-year-old Mexican woman from Chiapas, warm brown skin, a long single black braid over one shoulder, a white cotton blouse with small red and green "
       "embroidered flowers on the neckline, a plain dark-blue skirt)")
FID = ("@{FIDENCIO_GORDILLO} (55-year-old Mexican man, stocky, brown skin, short grey hair, a thick grey mustache, a grey palm-straw hat, a plain olive-green cotton shirt "
       "with rolled-up sleeves, dark jeans, a woven wool shoulder bag)")
ROS = ("@{ROSAURA_PENAGOS} (45-year-old Mexican woman, light tan skin, shoulder-length dyed auburn hair in a glossy blowout, red lipstick, big gold hoop earrings, "
       "a satin leopard-print blouse, tight black trousers)")
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

# Bordes: orden fijo I - F - R. Rosaura o Fidencio le hablan a Itzel -> espalda de ella LEFT; Itzel le habla a Fidencio o Rosaura -> espalda RIGHT;
# Fidencio le habla a Rosaura -> espalda de ella RIGHT; Rosaura le habla a Fidencio -> espalda de él LEFT.
ITZ_B = "@{ITZEL_GORDILLO} seen from behind (a long single black braid, white embroidered cotton blouse)"
FID_B = "@{FIDENCIO_GORDILLO} seen from behind (grey palm-straw hat, olive-green cotton shirt, stocky)"
ROS_B = "@{ROSAURA_PENAGOS} seen from behind (shoulder-length glossy auburn hair, satin leopard-print blouse)"
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

IL = f"sitting on a low wooden stool on the LEFT at the workbench, polishing {AMBER}"       # Itzel
IS = "standing on the LEFT beside the workbench"                                           # Itzel de pie (desde r4)
FC = "standing in the middle of the workshop"                                               # Fidencio
RH = f"lying back in a woven hammock on the RIGHT, holding {PHONE}"                         # Rosaura en la hamaca
RS = "standing on the RIGHT beside the woven hammock"                                       # Rosaura de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rosaura YA hablando desde la hamaca con el celular; Itzel de espaldas (LEFT) puliendo. Plazo: antes de que se meta el sol.
 ("c01", D8("c01"), S("c01", "Rosaura", f"Medium close-up of {ROS} {YARD0}, {RH}, talking from the very first frame, bossy, she barely looks up from the phone", ITZ_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {ROS} {YARD}, {RH}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Itzel", one(f"Close-up of {ITZ} {YARD}, {IL}, tired but proud, she raises her eyes from the amber", "RIGHT"), "tired, firm, proud")),
 ("c03", 6, S("c03", "Rosaura", f"Close-up of {ROS} {YARD0}, {RH}, a lazy smile, she scrolls the phone", ITZ_B, "LEFT", "lazy, mocking",
     f"Close-up of {ROS} {YARD}, {RH}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {FID} {YARD}, standing in the open doorway of the workshop, already in place, a woven wool bag on his shoulder, he stops and slowly takes off his hat, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a straw hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled")),
 ("c05", 6, S("c05", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, she has just stood up from the hammock, a big nervous smile, she fixes her hair", FID_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {ROS} {YARD}, {RS}, a big nervous smile, she fixes her hair", "LEFT")),
 ("c06", 6, S("c06", "Itzel", f"Close-up of {ITZ} {YARD0}, {IL}, she hides her hands under the workbench, a shy smile", FID_B, "RIGHT", "soft, shy, tired",
     f"Close-up of {ITZ} {YARD}, {IL}, a shy smile", "RIGHT")),
 ("c07", 6, (talk("c07", "Fidencio", two(f"{ITZ} sitting on the LEFT on a low wooden stool at the workbench showing her open hands, and {FID} standing on the RIGHT beside her, "
     f"bending down to look at her hands {YARD0}, framed from the waist up; Fidencio, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fidencio", "Itzel"), "worried, tender, low"),
   talk("c07", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, worried and tender, looking down", "LEFT"), "worried, tender, low"))),
 ("c08", 6, talk("c08", "Rosaura", one(f"Close-up of {ROS} {YARD}, {RS}, she waves one hand with a fake laugh", "LEFT"), "dismissive, fake, light")),
 ("r2", 6, one(f"Close-up of {FID} {YARD}, {FC}, in silence, he turns his head and looks at a small empty glass display box on a wooden shelf, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Fidencio", f"Close-up of {FID} {YARD0}, {FC}, serious, his voice low, he gestures toward the shelf", ROS_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {FID} {YARD}, {FC}, serious, his voice low", "RIGHT")),
 ("c10", 6, S("c10", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, she shrugs, cool, examining her nails", FID_B, "LEFT", "cool, careless",
     f"Close-up of {ROS} {YARD}, {RS}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {ITZ} {YARD}, {IL}, in silence, she stops polishing, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Itzel", f"Close-up of {ITZ} {YARD0}, {IL}, her eyes shine, her voice breaks a little", ROS_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {ITZ} {YARD}, {IL}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Fidencio", f"Close-up of {FID} {YARD0}, {FC}, cold and serious", ROS_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {FID} {YARD}, {FC}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Rosaura", one(f"Close-up of {ROS} {YARD}, {RS}, she rolls her eyes and crosses her arms", "LEFT"), "careless, cold, mocking")),
 ("c14", 6, talk("c14", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm, slow")),
 ("c15", 6, S("c15", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, defiant, her chin up", FID_B, "LEFT", "defiant, mocking",
     f"Close-up of {ROS} {YARD}, {RS}, defiant, her chin up", "LEFT")),
 ("c16", D8("c16"), S("c16", "Fidencio", f"Close-up of {FID} {YARD0}, {FC}, firm and calm, he gestures slowly toward the open door", ROS_B, "RIGHT", "firm, calm, final",
     f"Close-up of {FID} {YARD}, {FC}, firm and calm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: polished pieces of golden amber glowing in a small wooden tray on the workbench in the warm window light, the polishing wheel slowly stops; only the amber and the bench, no people. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Rosaura", one(f"Close-up of {ROS} {YARD}, {RS}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused, slow")),
 ("c18", 6, talk("c18", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, firm, impatient", "RIGHT"), "firm, impatient")),
 ("c19", D8("c19"), S("c19", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, she leans in slightly and lowers her voice, enjoying it", FID_B, "LEFT", "sly, low, slow",
     f"Close-up of {ROS} {YARD}, {RS}, she lowers her voice, enjoying it", "LEFT")),
 ("r4", 6, f"Medium shot of {ITZ} {YARD}, she slowly stands up from the low wooden stool beside the workbench, surprised, her hand on her chest, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a black braid')}. Slow push-in. No dialogue."),
 ("c20", 6, talk("c20", "Itzel", one(f"Close-up of {ITZ} {YARD}, {IS}, surprised, her voice small", "RIGHT"), "surprised, soft, confused")),
 ("c21", D8("c21"), S("c21", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, a cruel little smile, she looks at the daughter", ITZ_B, "LEFT", "cruel, sweet, slow",
     f"Close-up of {ROS} {YARD}, {RS}, a little smile", "LEFT")),
 ("c22", 6, talk("c22", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, pale, his voice low and tight, he looks away", "RIGHT"), "low, tight, ashamed")),
 ("c23", 6, S("c23", "Itzel", f"Close-up of {ITZ} {YARD0}, {IS}, her eyes shine, she looks at her father", FID_B, "RIGHT", "hurt, soft, desperate",
     f"Close-up of {ITZ} {YARD}, {IS}, her eyes shine", "RIGHT")),
 # CTA con carisma (después del BLACK): Itzel sola, a cámara
 ("c24", 10, talk("c24", "Itzel", f"Close-up from the chest up of {ITZ} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves her braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Los muertos no reclaman nada.", "Ella ya no reclama nada."), ("Las traes llenas de cortadas.", "Las traes muy lastimadas."),
        ("Cállate, Rosaura.", "Ya basta, Rosaura."), ("¿Por una piedra y una malcriada?", "¿Por una piedra y por ella?"),
        ("a cruel little smile", "a little smile"), ("his face darkens", "he becomes serious"), ("enjoying it", "calm"), ("fake", "polite"),
        ("ashamed", "quiet"), ("tight", "quiet"), ("her voice breaks a little", "softly"),
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
          "Vertical scene from a Mexican TV drama, realistic, warm daylight inside a rustic wooden amber workshop in Chiapas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic workshop with a wooden workbench and golden amber pieces in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ITZEL_GORDILLO}", "a Mexican woman in her twenties with a long black braid and a white blouse with embroidered flowers"),
         ("@{FIDENCIO_GORDILLO}", "a stocky Mexican man in his fifties with a grey mustache, a grey palm-straw hat and an olive-green shirt"),
         ("@{ROSAURA_PENAGOS}", "a Mexican woman in her forties with glossy auburn hair, red lipstick, gold hoops and a leopard-print blouse"),
         (" @{LOC_TALLERAMBAR}", "")]
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
