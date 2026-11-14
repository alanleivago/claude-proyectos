"""Genera los clips de cenote-campana PARTE 1 (La Campana del Cenote, remake transformado de El Retén de @atriumstories_, Yucatán, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de golondrina-muelle (todas sus defensas: gatito en imagen, control de duplicados md5). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (el zapato del ingeniero tumba el cántaro de don Nicasio en la entrada del cenote) con figura y plazo (una hora, el cenote se cierra);
# poder SIN armas: cinco camionetas blancas por el camino blanco del monte, hombres de guayabera blanca con las manos cruzadas, el bastón de doña Zenaida, la campana. Insertos i* sin caras y reacciones r* mudas.
# Indicios del giro ANTES de revelarlo: "yo solo cuido la llave" (c04), Portilla trae la llave vieja (c05, r1), "la que sí firma" (c07), la llamada "sí, señora... mañana mismo firma" (c10, r2),
#   Cosme "es de doña Zenaida" (c11) y "esa señora ya no manda" (c12), la campana de bronce (i02, c14). Revelación: c24 (el cenote es de Zenaida) y c25 (la campana es para llamarla a ella).
# Giro familiar / gancho P2: la llave solo la tiene su familia (c29) + "le habló una señora" (c30) -> Zenaida contesta el celular de Portilla: "¿Maricruz? ¿Hija, eres tú?" (c34). Castigo para la Parte 2.
# Sin Navidad. Geografía fija en la entrada del cenote (monte bajo de Yucatán, mañana):
#   la reja vieja de madera con la campana de bronce en su poste a la IZQUIERDA; Nicasio al CENTRO-IZQUIERDA junto a la reja; Citlali a la IZQUIERDA detrás de él; Portilla a la DERECHA; Cosme a la DERECHA junto a una pickup gris.
#   Zenaida (desde c22) al CENTRO, sus cinco camionetas blancas detrás en el camino: mira a la IZQUIERDA (Nicasio/Citlali) o a la DERECHA (Portilla/Cosme).
#   c18-c19: corredor de la hacienda amarilla de Zenaida (LOC_HACIENDAAMARILLA2). CTA (c35): Nicasio solo junto a la reja, a cámara.
PAT0 = ("at the entrance of a cenote in the low green scrub forest of Yucatan @{LOC_CENOTEREJA2} on a sunny morning: a white limestone path, an old weathered wooden gate between low dry-stone walls, "
        "an old bronze bell hanging from a henequen rope on a wooden post beside the gate, stone steps going down to turquoise water behind, a small palm-thatched palapa with hammocks; "
        "no readable text, no signs, no logos")
PAT = PAT0 + "; nobody else in the background, no extras, nobody besides the person described"
HAC = ("in the arched corridor of an old yellow henequen hacienda in Yucatan @{LOC_HACIENDAAMARILLA2}: yellow walls, white stone arches, red tile floor, tall wooden doors, morning light; "
       "no logos, no readable text")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Nicasio lleva sombrero (de huano); solo Portilla traje gris claro y planos enrollados; solo Citlali hipil blanco bordado;
# solo Cosme chaleco naranja y barba; solo Zenaida bastón y moño blanco; solo Fidencio guayabera azul cielo.
NIC = ("@{NICASIO_CANCHE} (71-year-old Mayan man from Yucatan, short and thin, dark brown skin, round weathered face, thin grey mustache, short grey hair under a worn palm-leaf hat, no glasses, "
       "a plain white cotton shirt, white cotton trousers, rope sandals, his hands kept low)")
POR = ("@{OSIEL_PORTILLA2} (40-year-old Mexican man, light skin, slim, clean-shaven narrow face, black hair slicked back with gel, no hat, no glasses on his face, "
       "a light-grey slim suit with an open white shirt and no tie, his hands kept low, he never points a finger at anyone)")
CIT = ("@{CITLALI_CANCHE2} (24-year-old Mayan woman from Yucatan, clearly an adult, brown skin, round face, black hair in a low bun, small gold filigree earrings, no hat, "
       "a white hipil dress with a band of red and green embroidered flowers at the neck, her hands kept low)")
COS = ("@{COSME_BALAM2} (52-year-old Mexican man, tan skin, heavy-set, thick black beard with grey streaks, no hat, no glasses, an orange work safety vest with no text over a grey t-shirt, "
       "his hands kept low)")
ZEN = ("@{ZENAIDA_CAUICH2} (76-year-old Mexican woman, light-brown skin, serene oval face with deep wrinkles, white hair in a tight bun with a red ribbon, gold filigree earrings, no hat, no glasses, "
       "an elegant cream linen dress with fine white embroidery, a dark wooden cane with a silver tip in her right hand)")
FID = ("@{FIDENCIO_TZUC2} (45-year-old Mexican man, brown skin, square face, short black brush mustache, short black hair, no hat, no sunglasses, "
       "a sky-blue guayabera shirt, his hands crossed in front of him)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
KEY = "one old long black iron key held low in his RIGHT hand"
PLANS = "one rolled white blueprint held low in his LEFT hand"
PHONE = "one black phone held in the RIGHT hand"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

NS = "standing at the CENTER-LEFT of the path beside the old wooden gate"            # Nicasio
CL = "standing on the LEFT of the path behind the old wooden gate"                   # Citlali
PR = "standing on the RIGHT of the white limestone path"                            # Portilla
CR = "standing on the RIGHT beside a parked grey pickup truck"                      # Cosme
ZC = "standing in the CENTER of the path, five white pickup trucks parked far behind her on the white road"   # Zenaida

CLIPS = [
 # 1. Gancho (0-2 s): el cántaro roto, una hora y el cenote cerrado
 ("i01", 6, f"Close-up insert {PAT0}: a polished black leather shoe under light-grey suit trousers knocks over a red clay water jug on the white stones; the jug breaks in pieces "
            f"and the water runs across the stones right up to a pair of rope sandals that stay still. Only the shoe, the jug and the sandals, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, {PLANS}, calm and confident, a small proud half smile", "LEFT",
     NODOUBLE("man in a light-grey suit")), "calm, confident, unhurried, like a boss")),
 ("c02", 6, talk("c02", "Nicasio", one(f"Close-up of {NIC} {PAT}, {NS}, dignified, holding back his feelings, he glances down at the broken jug on the stones", "RIGHT",
     NODOUBLE("old man in a palm-leaf hat")), "dignified, hurt, quiet")),
 ("c03", 6, talk("c03", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, {PLANS}, he taps the rolled blueprint once against his palm, cold", "LEFT"),
     "cold, bureaucratic")),
 ("c04", 6, talk("c04", "Nicasio", one(f"Close-up of {NIC} {PAT}, {NS}, very calm, almost serene", "RIGHT"),
     "calm, careful, low")),
 ("c05", 6, talk("c05", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, he lifts {KEY} to chest height and shows it, mocking", "LEFT"),
     "mocking, cold")),
 ("r1", 6, one(f"Close-up of {NIC} {PAT}, {NS}, in silence, his eyes widen a little and then narrow, he stares at something at chest height, surprised", "RIGHT") + " Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Nicasio", one(f"Close-up of {NIC} {PAT}, {NS}, serious and surprised, quiet", "RIGHT"),
     "surprised, serious, low")),
 ("c07", 6, talk("c07", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, {KEY}, a cold little smile", "LEFT"),
     "cold, sure, short")),
 ("c08", 6, talk("c08", "Citlali", one(f"Close-up of {CIT} {PAT}, {CL}, worried, her eyes shine", "RIGHT",
     NODOUBLE("young woman in a white embroidered dress")), "worried, sincere, quick")),
 ("c09", 6, talk("c09", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, he turns his head sharply, dismissive", "LEFT"),
     "dismissive, cold")),
 ("c10", 6, talk("c10", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, he has turned half away and talks quietly into {PHONE} pressed to his ear, a satisfied look", "RIGHT"),
     "quiet, servile, almost a whisper")),
 ("r2", 6, one(f"Close-up of {NIC} {PAT}, {NS}, in silence, he frowns slowly and narrows his eyes, he has heard something", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. Cosme avisa; la reja; la campana
 ("c11", 6, talk("c11", "Cosme", one(f"Close-up of {COS} {PAT}, {CR}, serious and respectful, uneasy", "LEFT",
     NODOUBLE("bearded man in an orange vest")), "serious, respectful, low")),
 ("c12", 6, talk("c12", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, he lifts his chin, arrogant", "RIGHT"),
     "arrogant, cold")),
 ("i02", 6, f"Close-up insert {PAT0}: thick hands of a man in an orange vest close a new shiny padlock on a chain around the old wooden gate; just above, the old bronze bell hangs still "
            f"from its henequen rope. Only the hands, the chain and the bell, no faces. No dialogue."),
 ("c13", 6, talk("c13", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, {PLANS}, he leans his head forward a little, cold", "LEFT"),
     "cold, threatening, low")),
 ("c14", 6, talk("c14", "Nicasio", one(f"Close-up of {NIC} {PAT}, {NS}, calm, he glances at the old bronze bell on the post beside him", "RIGHT"),
     "calm, firm, low")),
 ("c15", 6, talk("c15", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, he laughs once, amused and arrogant", "LEFT"),
     "amused, mocking")),
 ("i03", 6, f"Close-up insert {PAT0}: an old brown hand pulls the henequen rope and the old bronze bell swings and rings clearly, three times, in the morning light. "
            f"Only the hand, the rope and the bell, no faces. Sound of the bell, no dialogue."),
 ("c16", 6, talk("c16", "Citlali", one(f"Close-up of {CIT} {PAT}, {CL}, confused and worried, she looks toward her grandfather", "RIGHT"),
     "confused, quiet, quick")),
 ("c17", 6, talk("c17", "Nicasio", one(f"Close-up of {NIC} {PAT}, {NS}, he turns his eyes gently toward his granddaughter, a very small knowing smile", "LEFT"),
     "calm, tender, sure")),
 ("r3", 6, one(f"Close-up of {CIT} {PAT}, {CL}, in silence, she looks down the white road with worry, a light breeze", "RIGHT") + " Slow push-in. No dialogue."),
 # 3. Montaje paralelo: la hacienda amarilla
 ("c18", 6, talk("c18", "Fidencio", one(f"Close-up of {FID} {HAC}, he has just stopped, serious and quick, slightly out of breath", "LEFT",
     NODOUBLE("man in a sky-blue guayabera")), "serious, quick, respectful")),
 ("c19", 6, talk("c19", "Zenaida", one(f"Close-up of {ZEN} {HAC}, seated in a carved wooden chair, she slowly sets a small cup on a side table and lifts her eyes, very serious", "RIGHT",
     NODOUBLE("old woman with white hair in a bun")), "serious, low, slow, the one who is in charge")),
 ("i04", 6, f"Aerial drone shot on a sunny morning over the green scrub forest of Yucatan: five white pickup trucks with no logos leave the arches of a yellow hacienda "
            f"and drive in a line along a straight white road, raising a little white dust. No people visible, no letters on the trucks. No dialogue."),
 ("c20", 6, talk("c20", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, he checks the time on his wrist, dismissive", "LEFT"),
     "dismissive, cold")),
 ("c21", 6, talk("c21", "Cosme", one(f"Close-up of {COS} {PAT}, {CR}, his hands empty and low, he looks down the road, serious and uneasy", "LEFT"),
     "serious, quick, low")),
 # 4. La llegada: camionetas, el bastón, el cántaro
 ("i05", 6, f"Wide shot {PAT0}: five white pickup trucks stop on the white road in front of the gate; men in plain white guayaberas step out "
            f"and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("i06", 6, f"Close-up insert {PAT0}: the silver tip of a dark wooden cane touches the white stones beside the broken red clay jug; the hem of a cream linen dress "
            f"and embroidered flat shoes step out of a white pickup truck. Only the cane, the jug, the hem and the shoes, no faces. No dialogue."),
 ("c22", 6, talk("c22", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, calm and sad, she looks down at the broken jug on the stones, then up", "LEFT",
     NODOUBLE("old woman with white hair in a bun")), "calm, warm, low")),
 ("c23", 6, talk("c23", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, {PLANS}, nervous, a forced polite smile", "LEFT"),
     "nervous, quick, polite")),
 ("c24", 6, talk("c24", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, very calm, she does not blink", "RIGHT"),
     "calm, final, low")),
 # 5. La campana (música cálida c25-c26)
 ("c25", 6, talk("c25", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, her eyes soft, she glances toward the old bronze bell", "LEFT"),
     "warm, sincere, low")),
 ("c26", 6, talk("c26", "Nicasio", one(f"Close-up of {NIC} {PAT}, {NS}, moved and proud, he keeps his worn palm-leaf hat ON his head the whole time, his plain white LONG-sleeved cotton shirt as in his reference sheet", "RIGHT"),
     "moved, quiet, proud")),
 # 6. Inversión: el dinero y el plazo cambian de lado (el castigo queda para la Parte 2)
 ("c27", 6, talk("c27", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, she turns her eyes slowly to her left, firm again", "RIGHT"),
     "firm, slow, low")),
 ("c28", 6, talk("c28", "Portilla", one(f"Close-up of {POR} {PAT}, {PR}, ashamed, his hands open and low, he lowers his eyes", "LEFT"),
     "ashamed, pleading, quick")),
 ("c29", 6, talk("c29", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, she narrows her eyes slowly, suspicious", "RIGHT"),
     "calm, suspicious, quiet")),
 ("r4", 6, one(f"Close-up of {POR} {PAT}, {PR}, in silence, he swallows and glances down at {KEY}", "LEFT") + " Slow push-in. No dialogue."),
 ("c30", 6, talk("c30", "Cosme", one(f"Close-up of {COS} {PAT}, {CR}, his hands low, serious, he glances toward the man in the grey suit; his orange vest is completely plain, no letters, no words, no logo printed anywhere on it", "LEFT"),
     "serious, low, careful")),
 ("c31", 6, talk("c31", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, still, calm and final, both hands resting on her cane", "RIGHT"),
     "calm, final, slow")),
 ("c32", 6, talk("c32", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, her eyes soft, a small warm smile, she speaks gently toward the young woman", "LEFT"),
     "gentle, sincere, warm")),
 ("i07", 6, f"Close-up insert {PAT0}: the new padlock and the chain drop open onto the white stones and the old wooden gate swings open; behind it the stone steps go down to bright turquoise water. "
            f"Only the gate, the chain and the water, no faces. No dialogue."),
 # 7. El celular: gancho a la Parte 2
 ("c33", 6, talk("c33", "Fidencio", one(f"Close-up of {FID} {PAT0}, standing on the RIGHT near the white trucks, {PHONE}, it is buzzing, he lifts it a little, grave", "LEFT",
     NODOUBLE("man in a sky-blue guayabera")), "grave, low")),
 ("c34", 6, talk("c34", "Zenaida", one(f"Close-up of {ZEN} {PAT0}, {ZC}, {PHONE} pressed to her ear, she listens, then her face slowly changes, serious and hurt", "RIGHT"),
     "surprised, hurt, very low")),
 ("r5", 6, one(f"Close-up of {POR} {PAT}, {PR}, in silence, he goes pale and freezes, his lips slightly open", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Nicasio junto a la reja abierta, a cámara
 ("c35", 10, talk("c35", "Nicasio", f"Medium close-up of {NIC} {PAT}, alone, standing beside the open old wooden gate with the bronze bell, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he adjusts his palm-leaf hat, rests a hand on the bell post, "
     f"tilts his head, raises his eyebrows, nods and smiles a little. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("knocks over", "tips over")]
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("Entonces son cien mil.", "Entonces me paga el permiso."), ("Y él me debe cien mil.", "Y él me debe el permiso."),
        ("¿Cien mil le pediste a él?", "¿Dinero le pediste a él?"), ("Nadie te va a oír.", "Aquí nadie viene."),
        ("the jug breaks in pieces", "the jug cracks"), ("close a new shiny padlock on a chain around", "hang a new padlock on a chain around"),
        ("his face turns serious and hurt", "his face turns serious"), ("her face slowly changes, serious and hurt", "her face slowly turns serious"),
        ("goes pale and freezes", "stays very still"), ("slightly out of breath", "quick")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright morning light in the green scrub forest of Yucatan, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the entrance of a cenote in Yucatan on a sunny morning, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm morning light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{NICASIO_CANCHE}", "an old Mayan man in a palm-leaf hat"), ("@{OSIEL_PORTILLA2}", "a Mexican engineer in a light-grey suit"),
         ("@{CITLALI_CANCHE2}", "a young Mayan woman in a white embroidered dress"), ("@{COSME_BALAM2}", "a bearded Mexican worker in an orange vest"),
         ("@{ZENAIDA_CAUICH2}", "an elegant old Mexican lady with a cane"), ("@{FIDENCIO_TZUC2}", "a Mexican man in a sky-blue guayabera"),
         (" @{LOC_CENOTEREJA2}", ""), (" @{LOC_HACIENDAAMARILLA2}", "")]
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
