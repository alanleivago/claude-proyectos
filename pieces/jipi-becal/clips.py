"""Genera los clips de jipi-becal PARTE 1 (La Cueva de Bécal, segunda versión muy transformada de "Llegó a casa y vio lo que su esposa le hacía a su hija" de @atriumstories_: aquí la suegra y la nuera, y la que pone orden es la abuela; tejedoras de sombrero jipi de Bécal, Campeche; MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de garrafon-bernal (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4)."""
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
# Gancho 0-2 s: Nicté tejiendo un sombrero en la penumbra de la cueva (i01, su presentación) y Zoraida arriba, abanicándose junto a la boca de la cueva con la escalera tirada en el suelo:
# "Doce sombreros antes del sábado, Nicté. Y la escalera se queda aquí arriba." (injusticia + plazo).
# Plazo: el sábado; vuelve invertido al final: "Lisandro baja de la plataforma el sábado. Para el sábado, los doce sombreros los tejes tú." (c27).
# Capas: la escalera y la cueva -> llega la abuela (r1, presentación) -> sobras y petate (c09) -> el celular confiscado (c13-c16, i03) -> la abuela llama al nieto (c20)
# -> la mentira de Zoraida: "le dijiste que Nicté se fue, que lo dejó por otro" (c21) -> Zoraida también salió de esa cueva (c24) -> plazo invertido (c27) -> gancho: Zoraida llama a escondidas a su hijo (c31).
# Lisandro (el nieto, en una plataforma en el mar) no sale: solo se nombra y no se oye.
# Geografía fija. Cueva (i01, c02): Nicté sentada en un banquito bajo el tragaluz, mira ARRIBA. Patio: boca de la cueva y silla de plástico a la IZQUIERDA (Zoraida; Nicté al salir), corredor de arcos a la DERECHA (la abuela).
# Plano de presentación: Nicté i01, Zoraida c01, Apolonia r1. CTA (c32): Apolonia sola en el patio, a cámara. Sin Navidad.
CAVE0 = ("inside a small natural limestone cave under a backyard in Bécal, Campeche @{LOC_CUEVABECAL}: rough pale limestone walls glistening with humidity, a single shaft of daylight falling from a round opening in the rock ceiling, "
         "a low wooden stool, bundles of pale cream palm fibers hanging from a cord on the wall, a dim and humid atmosphere; no ladder inside, no readable text, no signs, no logos")
CAVE = CAVE0 + "; nobody else in the cave, no extras, nobody besides the person described"
YARD0 = ("in the backyard of a pale pink house in Bécal, Campeche @{LOC_PATIOBECAL} in bright late-morning light: a white limestone wall, a big leafy tree giving shade, "
         "a round cave opening in the ground with a low stone rim on the LEFT, a white plastic chair beside it, a corridor of arches of the pink house on the RIGHT, bundles of pale palm fibers drying on a rope; "
         "no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Apolonia pelo blanco, huipil blanco bordado, rebozo negro y bastón; solo Zoraida pelo vino, lentes de carey en la cabeza, blusa de leopardo y abanico negro;
# solo Nicté vestido azul cielo deslavado, mandil beige y dedos vendados con tela blanca.
APO = ("@{APOLONIA_CHABLE} (81-year-old Maya Mexican woman, deep brown wrinkled skin, small and thin but upright, white hair in a low bun, small gold earrings, "
       "a white embroidered huipil dress with bands of red and green flowers at the square neckline and hem, a black rebozo over her shoulders, a dark wooden cane in her RIGHT hand)")
ZOR = ("@{ZORAIDA_CANUL} (56-year-old Mexican woman, light-brown skin, plump, short teased hair dyed burgundy red, big tortoiseshell sunglasses pushed up on her head, red lipstick, "
       "a leopard-print blouse, white capri pants, gold sandals, many gold bangles on both wrists, a black lace folding fan in her RIGHT hand, a small gold handbag hanging from her LEFT shoulder)")
NIC = ("@{NICTE_UCAN} (27-year-old adult Maya Mexican woman, brown skin, slim, black hair pulled back in a low bun with a few loose strands, no makeup, "
       "a faded sky-blue cotton dress, a beige apron with two front pockets, her fingers wrapped in strips of white cloth tape, plain brown sandals)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
LADDER = "a plain wooden ladder"
HAT = "an unfinished pale cream palm hat on a wooden hat mold"
PINK = "a small phone in a cracked pink case"
GOLD = "a phone in a shiny gold case"
UP = f"{LADDER} lying flat on the ground beside the cave opening"        # c01-c06 (antes de bajarla)
DOWN = f"{LADDER} standing inside the cave opening, its top sticking out"  # desde i02
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
LOOKUP = f"{SOLO}, eyes looking up toward the bright round opening in the rock ceiling, toward someone far above outside the frame"
LOOKDOWN = f"{SOLO}, eyes looking down into the round cave opening beside her, toward someone far below outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

def vert(desc, look, extra=""):
    """Como one() pero con la mirada arriba/abajo (diálogo entre la boca de la cueva y el fondo)."""
    return f"{desc}, {look}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

ZL = f"sitting on the white plastic chair on the LEFT at the stone rim of the cave opening, {UP}"   # Zoraida (gancho)
ZLS = "standing on the LEFT beside the white plastic chair and the cave opening"                     # Zoraida (desde c05)
AR = "standing on the RIGHT under the arches of the corridor"                                         # Apolonia
NL = f"standing on the LEFT beside the cave opening, {DOWN}"                                          # Nicté (desde c07)
NC = "sitting on the low wooden stool under the shaft of daylight"                                    # Nicté (cueva)
FLOOR = f"{SOLO}, eyes looking down at the ground in front of her"                                    # Apolonia al teléfono

CLIPS = [
 # 1. Gancho (0-2 s): Nicté en la cueva y Zoraida arriba con la escalera tirada; plazo: el sábado
 ("i01", 6, f"Medium shot of {NIC} {CAVE}, {NC}, her taped fingers weave {HAT} on her knees, then she stops and looks up, tired and anxious, "
            f"{LOOKUP}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c01", 6, talk("c01", "Zoraida", f"Medium shot of {ZOR} {YARD}, {ZL}, she fans herself slowly with the black lace fan, comfortable and cold, "
     f"{LOOKDOWN}; {PRES}; {ALONE}; {NODOUBLE('woman in a leopard-print blouse')}.", "cold, bossy, unbothered")),
 ("c02", 6, talk("c02", "Nicté", vert(f"Close-up of {NIC} {CAVE}, {NC}, she raises her taped hands a little toward the light, her eyes shine", LOOKUP),
     "tired, pleading, quiet")),
 ("c03", 6, talk("c03", "Zoraida", vert(f"Close-up of {ZOR} {YARD}, {ZL}, a cold little smile, she keeps fanning herself", LOOKDOWN),
     "cold, mocking, calm")),
 ("r1", 6, f"Medium shot of {APO} {YARD}, {AR}, she has just arrived and stands still leaning on her cane, she sees the chair and the ladder on the ground and her face turns serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('old woman in a white huipil')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she lifts her cane a little toward the ladder on the ground, stern", "LEFT"),
     "stern, firm, slow")),
 ("c05", 6, talk("c05", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she has just stood up from the chair, surprised, she snaps the fan shut and forces a big smile", "RIGHT"),
     "surprised, falsely sweet")),
 ("c06", 6, talk("c06", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she taps her cane once on the ground, her eyes hard", "LEFT"),
     "firm, commanding, low")),
 ("i02", 6, f"Close-up insert {YARD0}: two hands with many gold bangles lower {LADDER} into the round cave opening with the low stone rim until it stands inside. "
            f"Only the hands, the ladder and the opening, no faces. No dialogue."),
 # 2. Nicté sale: sobras y petate
 ("c07", 6, talk("c07", "Nicté", one(f"Close-up of {NIC} {YARD}, {NL}, she has just climbed out, dust on her apron, she squints in the daylight, grateful", "RIGHT",
     NODOUBLE("woman in a sky-blue dress")), "grateful, shaky, quiet")),
 ("c08", 6, talk("c08", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, worried, she looks the woman up and down", "LEFT"),
     "worried, tender")),
 ("c09", 6, talk("c09", "Nicté", one(f"Close-up of {NIC} {YARD}, {NL}, she lowers her eyes and hides her taped fingers in the apron pockets", "RIGHT"),
     "ashamed, quiet")),
 ("c10", 6, talk("c10", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she opens the fan again and waves it, dismissive", "RIGHT"),
     "dismissive, falsely sweet")),
 ("c11", 6, talk("c11", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, calm and firm, she does not blink", "LEFT"),
     "calm, firm, cutting")),
 ("c12", 6, talk("c12", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, softer, she turns her eyes to the woman in the sky-blue dress", "LEFT"),
     "soft, worried")),
 # 3. El celular
 ("c13", 6, talk("c13", "Nicté", one(f"Close-up of {NIC} {YARD}, {NL}, her eyes shine, she glances quickly at the gold handbag of the other woman", "RIGHT"),
     "sad, quiet, honest")),
 ("r2", 6, one(f"Close-up of {ZOR} {YARD}, {ZLS}, in silence, she presses her LEFT hand on the small gold handbag on her shoulder, her smile frozen", "RIGHT") + " Slow push-in. No dialogue."),
 ("c14", 6, talk("c14", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she lifts her chin, smug", "RIGHT"),
     "smug, confident")),
 ("c15", 6, talk("c15", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she tilts her head, her eyes narrow", "LEFT"),
     "ironic, cutting, slow")),
 ("c16", 6, talk("c16", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she holds out her LEFT hand palm up, the cane still in her RIGHT hand", "LEFT"),
     "firm, final")),
 ("i03", 6, f"Close-up insert {YARD0}: a hand with many gold bangles takes {PINK} out of a small gold handbag and drops it into an old wrinkled brown hand. "
            f"Only the two hands, the handbag and the phone, no faces, the phone screen is dark. No dialogue."),
 ("c17", 6, talk("c17", "Nicté", one(f"Close-up of {NIC} {YARD}, {NL}, she looks at the phone, hurt and confused", "RIGHT"),
     "hurt, quiet")),
 ("c18", 6, talk("c18", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she smiles with contempt toward the woman in the sky-blue dress", "RIGHT"),
     "cruel, sweet, calm")),
 ("c19", 6, talk("c19", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she holds {PINK} in her LEFT hand and presses a button with her thumb", "LEFT"),
     "calm, determined")),
 ("r3", 6, one(f"Close-up of {NIC} {YARD}, {NL}, in silence, she clasps her taped hands under her chin, hopeful, her eyes shine", "RIGHT") + " Slow push-in. No dialogue."),
 ("c20", 6, talk("c20", "Apolonia", vert(f"Close-up of {APO} {YARD}, {AR}, she holds {PINK} to her ear with her LEFT hand, talking on the phone", FLOOR),
     "warm, firm, on the phone")),
 ("r4", 6, vert(f"Close-up of {APO} {YARD}, {AR}, in silence, {PINK} still at her ear, she listens and her face hardens slowly", FLOOR) + " Slow push-in. No dialogue."),
 ("c21", 6, talk("c21", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she slowly lowers the phone, her voice cold", "LEFT"),
     "cold, disappointed, slow")),
 ("c22", 6, talk("c22", "Nicté", one(f"Close-up of {NIC} {YARD}, {NL}, shocked, a tear runs down her cheek", "RIGHT"),
     "shocked, hurt")),
 ("c23", 6, talk("c23", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she fans herself, proud and disdainful", "RIGHT"),
     "disdainful, proud")),
 # 4. La abuela pone orden: plazo invertido
 ("c24", 6, talk("c24", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she raises one eyebrow, almost amused, then serious", "LEFT"),
     "ironic, then firm")),
 ("c25", 6, talk("c25", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she crosses her arms with the fan closed, defiant", "RIGHT"),
     "defiant, arrogant")),
 ("c26", 6, talk("c26", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, she leans on her cane and lifts her chin", "LEFT"),
     "calm, cutting, final")),
 ("c27", 6, talk("c27", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, slow and solemn, she points her cane toward the cave opening", "LEFT"),
     "solemn, firm, slow")),
 ("r5", 6, one(f"Close-up of {ZOR} {YARD}, {ZLS}, in silence, the fan stops in mid-air, her smile drops, she glances at the cave opening", "RIGHT") + " Slow push-in. No dialogue."),
 ("c28", 6, talk("c28", "Zoraida", one(f"Close-up of {ZOR} {YARD}, {ZLS}, she touches her chest, outraged", "RIGHT"),
     "outraged, whiny")),
 ("c29", 6, talk("c29", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, a tiny dry smile, she leans on her cane", "LEFT"),
     "dry, ironic, calm")),
 ("c30", 6, talk("c30", "Apolonia", one(f"Close-up of {APO} {YARD}, {AR}, warm and protective, she turns her eyes to the woman in the sky-blue dress and nods", "LEFT"),
     "warm, protective")),
 # 5. Gancho a la Parte 2: Zoraida llama a escondidas a su hijo
 ("i04", 6, f"Close-up insert {YARD0}: by the white limestone wall, a hand with many gold bangles takes {GOLD} out of a small gold handbag. "
            f"Only the hand, the handbag and the phone, no faces, the screen is dark. No dialogue."),
 ("c31", 6, talk("c31", "Zoraida", vert(f"Close-up of {ZOR} {YARD}, standing alone beside the white limestone wall, she holds {GOLD} to her ear with her RIGHT hand, whispering, glancing over her shoulder",
     f"{SOLO}, eyes glancing sideways over her shoulder"), "whispering, sweet, scheming")),
 ("r6", 6, one(f"Close-up of {APO} {YARD}, {AR}, in silence, she slowly turns her head as if she heard something, serene, a knowing look", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Apolonia sola en el patio, a cámara
 ("c32", 10, talk("c32", "Apolonia", f"Close-up from the chest up of {APO} {YARD}, alone, standing in the yard, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"adjusts the black rebozo on her shoulder with her free hand, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"),
        ("a tear runs down her cheek", "her eyes shine")]
# Frases primero: si no, "cruel"/"hurt" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y la escalera se queda aquí arriba.", "Y hoy no subes hasta acabar."), ("Tú tejes en la cueva y te callas.", "Tú sigue tejiendo allá abajo."),
        ("Mi hijo se cansó de ti, Nicté.", "Mi hijo ya no te quiere, Nicté."), ("Que lo dejó por otro.", "Que ya no lo quería."),
        ("Dame ese celular.", "Préstame ese celular."), ("Ya anda muy confundida.", "Ya anda muy cansada."), ("Y hoy se acabó.", "Y hoy eso cambia."),
        ("she points her cane toward the cave opening", "she looks toward the cave opening"), ("she lifts her cane a little toward the ladder on the ground", "she looks at the ladder on the ground"),
        ("taps her cane once on the ground", "leans on her cane"), ("whispering, sweet, scheming", "soft, quiet"), ("whispering", "talking softly"), ("scheming", "quiet"),
        ("she smiles with contempt toward", "she looks at"), ("drops it into", "places it in"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("outraged", "surprised"), ("defiant", "serious"), ("contempt", "a cool look"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright late-morning light in the backyard of a pink house in Bécal, Campeche, limestone and palm fibers, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a small town in Campeche in the morning, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft daylight, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{APOLONIA_CHABLE}", "a small very old Maya Mexican woman with white hair in a bun, a white embroidered huipil, a black rebozo and a wooden cane"),
         ("@{ZORAIDA_CANUL}", "a plump Mexican woman in her fifties with short burgundy hair, sunglasses on her head and a leopard-print blouse"),
         ("@{NICTE_UCAN}", "a slim adult Maya Mexican woman in a faded sky-blue dress and a beige apron, her fingers wrapped in white cloth tape"),
         (" @{LOC_CUEVABECAL}", ""), (" @{LOC_PATIOBECAL}", "")]
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
    want = set(sys.argv[1:])
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
            files, log = gen(variant(body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()  # solo contra los clips ya guardados (c*/i*/r*.mp4), nunca contra la descarga misma
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"  # Flow devolvió un clip ya bajado
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
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
