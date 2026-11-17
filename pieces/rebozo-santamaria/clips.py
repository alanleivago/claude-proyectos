"""Genera los clips de rebozo-santamaria PARTE 1 (El Rebozo de Santa María, MEXI STORIES, cuenta @mexitve) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Variante transformada de la saga de la madrastra de @atriumstories_ ("Llegó a casa y vio lo que su esposa le hacía a su hija", 7705076412604091678, 632K; madrastra-justicia, mediana 336K):
en el taller de rebozos de seda de Santa María del Río, San Luis Potosí, Baudelio (58) vuelve antes de la feria y encuentra a su hija Florencia (26) empuntando rebozos de rodillas
mientras su esposa Yolanda (46) descansa en el sillón con el celular y el rebozo de bodas de Otilia, la madre difunta, en los hombros. Plazo: "antes de que toquen las seis";
se invierte contra ella. Giro: Yolanda encontró en el ropero una carta de Otilia: "Baudelio, perdóname, Florencia no es…".
Copia del clips.py de gaviota-bacalar-p2 (diálogo AL INICIO del prompt, encuadres de Atrium y todas las defensas: gatito en imagen, reload_flow, new_project, duplicados md5,
TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4). Si un OTS sale con un doble: python -I clips.py <ID> --one"""
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
# Geografía fija (patio-taller de una casona de cantera rosa): Florencia a la IZQUIERDA en el bastidor de empuntar; Baudelio a la IZQUIERDA, a la derecha de su hija;
# Yolanda a la DERECHA junto al sillón de mimbre bajo los arcos. El rebozo azul de bolitas blancas: en los hombros de Yolanda hasta c12, en los de Florencia desde c13.
YARD0 = ("in the courtyard workshop of an old pink-stone colonial house in Santa María del Río, San Luis Potosí @{LOC_REBOZOSLP} in the late afternoon: a stone arcade with arches, "
         "skeins of dyed silk thread hanging to dry on a line, a large wooden knotting frame with an unfinished silk rebozo stretched on it, a wicker armchair in the shade of the arcade, "
         "potted red geraniums, warm golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
REBOZO = "a deep-blue silk rebozo shawl with tiny white dots and a long knotted fringe"
FRAME = "a large wooden knotting frame with the long silk fringe of an unfinished rebozo"
CHAIR = "a wicker armchair"
PHONE = "a phone in a pink case"
LETTER = "an old yellowed envelope tied with a faded blue ribbon"
BAU = ("@{BAUDELIO_TOVAR} (58-year-old Mexican man, medium build, light brown skin, wavy salt-and-pepper hair combed back, a thick salt-and-pepper mustache, "
       "a white long-sleeve collared cotton shirt with its collar clearly visible, a black vest, grey trousers, black shoes)")
YOL0 = ("@{YOLANDA_ZAMARRIPA} (46-year-old Mexican woman, fair skin, a short platinum-blonde bob, big gold hoop earrings, long red nails, red lipstick, "
        "a fuchsia satin blouse, black leggings, leopard-print slippers")
YOLR = YOL0 + f", {REBOZO} draped over her shoulders)"   # hasta c12
YOL = YOL0 + ", no shawl)"                                # desde c12
FLO0 = ("@{FLORENCIA_TOVAR} (26-year-old Mexican woman, brown skin, long black hair in two braids, a plain mustard-yellow cotton blouse, a long brown skirt, "
        "a beige work apron, brown sandals")
FLO = FLO0 + ")"
FLOR = FLO0 + f", {REBOZO} over her shoulders)"           # desde c13
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

# Bordes: Yolanda le habla a Baudelio -> espalda de Baudelio LEFT; Baudelio o Florencia le hablan a Yolanda -> espalda de Yolanda RIGHT;
# Yolanda le habla a Florencia -> espalda de Florencia LEFT; Florencia le habla a su papá -> espalda de Baudelio RIGHT.
BAU_B = "@{BAUDELIO_TOVAR} seen from behind (wavy salt-and-pepper hair, a black vest over a white long-sleeve shirt, medium build)"
YOLR_B = "@{YOLANDA_ZAMARRIPA} seen from behind (short platinum-blonde bob, gold hoop earrings, a deep-blue silk shawl with tiny white dots over her fuchsia satin blouse)"
YOL_B = "@{YOLANDA_ZAMARRIPA} seen from behind (short platinum-blonde bob, gold hoop earrings, fuchsia satin blouse, no shawl)"
FLO_B = "@{FLORENCIA_TOVAR} seen from behind (long black hair in two braids, mustard-yellow blouse, the ties of a beige apron at her back)"
FLOR_B = "@{FLORENCIA_TOVAR} seen from behind (long black hair in two braids, a deep-blue silk shawl with tiny white dots over her mustard-yellow blouse)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
MUTE = "Nobody speaks, all mouths closed. No dialogue."
ONE_FROM = 3  # k (0-based): intentos 4-6 usan el prompt single

def ots(speaker, listener, side):
    return (f"Over-the-shoulder shot from behind {listener}: the listener's blurred shoulder and the back of the head fill the {side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {speaker}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."

D8 = lambda cid: 8 if len(" ".join(L[cid]).split()) > 13 else 6

BL = "standing on the LEFT in the stone arcade, near the wooden knotting frame"                    # Baudelio
FL = f"standing on the LEFT beside {FRAME}"                                                      # Florencia (desde c06)
YR = f"standing on the RIGHT under the stone arches beside {CHAIR}"                              # Yolanda (desde r2)

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    """OTS hablado + respaldo single."""
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Yolanda YA hablando, recostada en el sillón con el celular y el rebozo de la difunta; Florencia de rodillas en primer plano, de espaldas (LEFT).
 ("c01", 6, (talk("c01", "Yolanda", ots(f"Medium shot of {YOLR} {YARD0}, lounging in {CHAIR} on the RIGHT under the arches, {PHONE} in her hand, talking from the very first frame, "
     f"bossy and lazy, she barely looks up from the phone", FLO_B + ", kneeling at the wooden knotting frame, her hands busy knotting silk fringe", "LEFT") + " " + MOUTH("Yolanda", "Florencia"),
     "bossy, lazy, mocking"),
   talk("c01", "Yolanda", f"Medium shot of {YOLR} {YARD}, lounging in {CHAIR}, {PHONE} in her hand, talking from the very first frame, bossy and lazy; {gaze('LEFT')}; {PRES}; {ALONE}.",
     "bossy, lazy, mocking"))),
 # r1: presentación de Baudelio, recién llegado, se queda quieto mirando
 ("r1", 6, f"Medium shot of {BAU} {YARD}, {BL}, already standing in place, he has just arrived and freezes, his face hardening as he looks at what is happening, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black vest')}. Slow push-in. No dialogue."),
 # r2: Yolanda se levanta de un brinco y esconde el celular
 ("r2", 6, f"Medium shot of {YOLR} {YARD}, she gets up quickly from {CHAIR} on the RIGHT, hides {PHONE} behind her back and puts on a forced smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('blonde woman')}. No dialogue."),
 ("c02", 6, S("c02", "Baudelio", f"Close-up of {BAU} {YARD0}, {BL}, cold and firm, his jaw tight", YOLR_B, "RIGHT", "cold, firm, low",
     f"Close-up of {BAU} {YARD}, {BL}, cold and firm, his jaw tight", "RIGHT")),
 ("c03", 6, talk("c03", "Yolanda", one(f"Close-up of {YOLR} {YARD}, {YR}, a nervous forced smile, she fixes her hair", "LEFT"), "nervous, falsely sweet")),
 ("c04", D8("c04"), S("c04", "Baudelio", f"Close-up of {BAU} {YARD0}, {BL}, proud and firm, he nods toward his daughter", YOLR_B, "RIGHT", "proud, firm",
     f"Close-up of {BAU} {YARD}, {BL}, proud and firm", "RIGHT")),
 # r3: presentación de Florencia, de rodillas en el bastidor
 ("r3", 6, f"Medium shot of {FLO} {YARD}, kneeling on the stone floor at {FRAME}, her fingers knotting the silk fringe, she slowly lifts her tired eyes, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with two braids')}. Slow push-in. No dialogue."),
 ("c05", 6, talk("c05", "Florencia", one(f"Close-up of {FLO} {YARD}, kneeling at {FRAME}, she looks up with a worried small smile", "RIGHT"), "worried, soft, humble")),
 ("c06", 6, (talk("c06", "Baudelio", two(f"{FLO} on the LEFT and {BAU} on the RIGHT, in profile facing each other beside {FRAME} {YARD0}, framed from the waist up; "
     f"Baudelio holds his daughter's hands and looks at her reddened fingertips, his eyes shine, slightly closer to the camera and in sharper focus") + " " + MOUTH("Baudelio", "Florencia"),
     "tender, hurt, low"),
   talk("c06", "Baudelio", one(f"Close-up of {BAU} {YARD}, {BL}, tender and hurt, looking down at something in his hands", "LEFT"), "tender, hurt, low"))),
 ("c07", 6, S("c07", "Yolanda", f"Close-up of {YOLR} {YARD0}, {YR}, she rolls her eyes and waves a hand", BAU_B, "LEFT", "dismissive, mocking",
     f"Close-up of {YOLR} {YARD}, {YR}, she rolls her eyes", "LEFT")),
 ("c08", 6, S("c08", "Baudelio", f"Close-up of {BAU} {YARD0}, {BL}, his eyes go to the blue shawl on her shoulders, hurt and serious", YOLR_B, "RIGHT", "hurt, serious, slow",
     f"Close-up of {BAU} {YARD}, {BL}, hurt and serious", "RIGHT")),
 ("c09", 6, talk("c09", "Yolanda", one(f"Close-up of {YOLR} {YARD}, {YR}, she strokes the blue silk shawl on her shoulders with her red nails, a cold smile", "LEFT"), "cold, cruel, calm")),
 # r4: reacción de Florencia (aporta: el rebozo de su madre)
 ("r4", 6, one(f"Close-up of {FLO} {YARD}, {FL}, in silence, her eyes shine, one hand on her chest", "RIGHT") + " Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Florencia", f"Close-up of {FLO} {YARD0}, {FL}, her voice breaking, her eyes shine", YOLR_B, "RIGHT", "hurt, moved, firm",
     f"Close-up of {FLO} {YARD}, {FL}, her eyes shine", "RIGHT")),
 ("c11", 6, talk("c11", "Baudelio", one(f"Close-up of {BAU} {YARD}, {BL}, he holds out his open hand, firm and final", "RIGHT"), "firm, cold, final")),
 ("c12", 6, S("c12", "Yolanda", f"Close-up of {YOLR} {YARD0}, {YR}, she pulls the blue shawl off her shoulders and holds it out with contempt", BAU_B, "LEFT", "contemptuous, mocking",
     f"Close-up of {YOLR} {YARD}, {YR}, she pulls the blue shawl off her shoulders with contempt", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: two weathered male hands with white shirt cuffs hold {REBOZO}, the fringe hanging, golden light on the silk; only the hands and the shawl, no face. No dialogue."),
 ("c13", 6, (talk("c13", "Baudelio", two(f"{FLO} on the LEFT and {BAU} on the RIGHT, in profile facing each other beside {FRAME} {YARD0}, framed from the waist up; "
     f"Baudelio gently places {REBOZO} over his daughter's shoulders, tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Baudelio", "Florencia"),
     "tender, warm, moved"),
   talk("c13", "Baudelio", one(f"Close-up of {BAU} {YARD}, {BL}, tender and warm, his eyes shine", "LEFT"), "tender, warm, moved"))),
 ("c14", D8("c14"), S("c14", "Florencia", f"Close-up of {FLOR} {YARD0}, {FL}, she gathers courage, serious", BAU_B, "RIGHT", "serious, sincere",
     f"Close-up of {FLOR} {YARD}, {FL}, serious", "RIGHT")),
 ("c15", 6, S("c15", "Yolanda", f"Close-up of {YOL} {YARD0}, {YR}, offended, she crosses her arms", FLOR_B, "LEFT", "offended, angry",
     f"Close-up of {YOL} {YARD}, {YR}, offended, arms crossed", "LEFT")),
 ("c16", 6, S("c16", "Florencia", f"Close-up of {FLOR} {YARD0}, {FL}, calm and firm, she raises her chin", YOL_B, "RIGHT", "calm, firm, a little ironic",
     f"Close-up of {FLOR} {YARD}, {FL}, calm and firm", "RIGHT")),
 ("c17", 6, S("c17", "Baudelio", f"Close-up of {BAU} {YARD0}, {BL}, hurt and angry, slow", YOL_B, "RIGHT", "hurt, firm, slow",
     f"Close-up of {BAU} {YARD}, {BL}, hurt and firm", "RIGHT")),
 ("c18", 6, S("c18", "Yolanda", f"Close-up of {YOL} {YARD0}, {YR}, defiant, arms crossed, a cold smile", BAU_B, "LEFT", "defiant, mocking",
     f"Close-up of {YOL} {YARD}, {YR}, defiant", "LEFT")),
 ("c19", D8("c19"), talk("c19", "Baudelio", one(f"Close-up of {BAU} {YARD}, {BL}, calm and final, he glances up at the church bell tower above the roofs", "RIGHT"), "calm, final, firm")),
 ("i02", 6, f"Wide shot above the old roofs of Santa María del Río, San Luis Potosí, at sunset: a pink-stone church bell tower, its bells swinging, warm sky; no people, no readable text. No dialogue."),
 ("c20", 6, talk("c20", "Yolanda", one(f"Close-up of {YOL} {YARD}, {YR}, a slow cold smile, she tilts her head, sure of herself", "LEFT"), "cold, confident, secretive")),
 ("c21", 6, S("c21", "Baudelio", f"Close-up of {BAU} {YARD0}, {BL}, he frowns, uneasy", YOL_B, "RIGHT", "uneasy, serious",
     f"Close-up of {BAU} {YARD}, {BL}, he frowns, uneasy", "RIGHT")),
 # r5: Yolanda saca la carta de detrás del cojín del sillón
 ("r5", 6, f"Medium shot of {YOL} {YARD}, {YR}, she reaches behind the cushion of {CHAIR} and slowly pulls out {LETTER}, a satisfied smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('blonde woman')}. Slow push-in. No dialogue."),
 ("c22", 6, S("c22", "Yolanda", f"Close-up of {YOL} {YARD0}, {YR}, she holds up {LETTER}, smug", BAU_B, "LEFT", "smug, calm",
     f"Close-up of {YOL} {YARD}, {YR}, she holds up {LETTER}, smug", "LEFT")),
 ("c23", 6, (talk("c23", "Florencia", two(f"{FLOR} on the LEFT and {BAU} on the RIGHT, in profile facing each other beside {FRAME} {YARD0}, framed from the waist up; "
     f"Florencia turns to her father, confused and afraid, slightly closer to the camera and in sharper focus") + " " + MOUTH("Florencia", "Baudelio"),
     "confused, worried"),
   talk("c23", "Florencia", one(f"Close-up of {FLOR} {YARD}, {FL}, confused and worried", "RIGHT"), "confused, worried"))),
 ("c24", 6, S("c24", "Baudelio", f"Close-up of {BAU} {YARD0}, {BL}, he holds out his hand, tense, his voice low", YOL_B, "RIGHT", "tense, low, firm",
     f"Close-up of {BAU} {YARD}, {BL}, he holds out his hand, tense", "RIGHT")),
 ("c25", 8, talk("c25", "Yolanda", one(f"Close-up of {YOL} {YARD}, {YR}, she unfolds an old yellowed handwritten letter and reads it aloud slowly, then stops abruptly after the words 'no es' "
     f"and looks up with a cold smile, the letter has no readable words", "LEFT"), "slow, reading aloud, cold")),
 ("c26", 6, S("c26", "Yolanda", f"Close-up of {YOL} {YARD0}, {YR}, she waves the old letter slowly, a smug cold smile", BAU_B, "LEFT", "smug, cold, calm",
     f"Close-up of {YOL} {YARD}, {YR}, she waves the old letter slowly, smug", "LEFT")),
 # CTA con carisma (después del BLACK): Baudelio solo, a cámara
 ("c27", 10, talk("c27", "Baudelio", f"Close-up from the chest up of {BAU} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; he starts with a serious look, leans slightly toward the camera, gestures openly with both hands, raises one eyebrow, smooths his mustache with two fingers, "
     f"tilts his head, nods, points his open palm toward the viewer and gives a warm knowing smile. Nobody else around.",
     "warm, charismatic, a little intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("A una difunta ya no le hace falta.", "Ya nadie lo usaba."), ("Tanto escándalo por un pedazo de seda.", "Tanto lío por una tela."),
        ("¿Correrme por esa malcriada?", "¿Sacarme por ella?"), ("Mentirosa.", "Eso no es cierto."), ("Y tú me tenías a mi hija de sirvienta.", "Y mi hija hacía todo."),
        ("No tienes derecho a abrirla.", "Esa carta no es tuya."), ("with contempt", "slowly"), ("contemptuous", "cool"), ("her voice breaking", "softly"),
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
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light in the stone courtyard of a colonial rebozo workshop in San Luis Potosí, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial courtyard with stone arches and silk threads drying, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{BAUDELIO_TOVAR}", "a Mexican man in his fifties with wavy salt-and-pepper hair, a thick mustache, a white shirt and a black vest"),
         ("@{YOLANDA_ZAMARRIPA}", "a fair-skinned Mexican woman in her forties with a short platinum-blonde bob, gold hoop earrings and a fuchsia satin blouse"),
         ("@{FLORENCIA_TOVAR}", "a Mexican woman in her twenties with two long black braids, a mustard-yellow blouse and a beige apron"),
         (" @{LOC_REBOZOSLP}", "")]
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
