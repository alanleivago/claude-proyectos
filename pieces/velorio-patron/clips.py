"""Genera los clips de velorio-patron PARTE 1 (El Velorio del Patrón, historia propia tipo CAPOS, premisa 3 de fuentes/atrium-vista/resumen.md, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4)."""
import json, re, subprocess, sys, os, tempfile, time, hashlib
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / buen-hijo-p2 c27 / mecanico c25 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25 / sazon-concha c16: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c13 / regreso-20 c28: frase repetida al final -> silencio tras la última palabra; QA regreso-20 c14/c22: 2ª frase perdida -> 8 s para dos frases
END = "After the last word the person stays silent until the end of the shot."
# Regla camionero v1: TODOS los planos hablados son de una sola persona (ONE + ALONE) con la mirada a un lado SIN nombrar al otro (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26: nadie entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Fórmula capos (resumen atrium-vista): gancho visual en 0-2 s (la caja con la ropa de Nati tirada en la puerta de la cocina) con cifra y plazo
# (diez minutos y tres mil pesos); luego la venta de ocho millones "mañana". Poder SIN armas: la escolta de doce hombres de manos cruzadas que obedece al anillo,
# el portón que se cierra, la firma. Insertos i* sin caras y reacciones mudas r* para el ritmo de <=2 s por plano. El castigo queda para la Parte 2.
# Geografía fija (solo define hacia dónde mira cada uno). Todo en el patio del velorio salvo el CTA:
#   Nati a la IZQUIERDA junto a la puerta de la cocina, mira a la DERECHA. Leonel e Ivonne a la DERECHA, miran a la IZQUIERDA.
#   Efrén (el licenciado) junto a la caja, al centro: mira a la DERECHA cuando habla a los hijos y a la IZQUIERDA cuando habla a Nati.
#   Nazario delante de los arcos, al fondo: mira a la IZQUIERDA (Nati) o a la DERECHA (Leonel, Ivonne). CTA (c32): Nati sola en la cocina, a cámara.
# Hojas de locación SIMPLES (lección intercambio): sin letreros, sin cruces con letras, sin marcas, sin adornos. El patrón difunto NO sale: caja cerrada, sin foto.
PAT = ("in the inner courtyard of an old Mexican hacienda @{LOC_PATIOVELORIO} during a wake at late afternoon: worn stone floor, ochre walls with stone arches, "
       "a closed dark wood coffin on a simple stand covered with white flowers, four tall lit candles, plain wooden chairs, an open kitchen door on one side; "
       "warm golden light; no readable text, no signs, no logos, no photos, no crosses with letters; "
       "no extras, nobody else in the courtyard besides the person described")
COC = ("in the big rustic hacienda kitchen @{LOC_COCINAGARIBAY} at late afternoon: ochre walls, a wood-fired stove with brown clay pots, one long plain wooden table, "
       "one window with warm golden light; no readable text, no calendar, no decorations, no signs, no logos")
# Anclas de identidad y ropa. Solo Leonel lleva lentes y bigote; solo Nazario barba; solo Ivonne perlas y pelo caoba; solo Nati mandil y trenza; solo Efrén calvo y de traje café.
# Sin uniformes, gafetes ni letras en la ropa. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27). Manos abiertas, nadie señala con el dedo.
RING = "one heavy gold signet ring with a small square red stone"
NAT = ("@{NATI_CERVERA} (25-year-old Mexican woman, clearly an adult, brown skin, round face with full cheeks and dark eyes, a small mole above the right corner of her lip, "
       "thick black hair in one long braid over her left shoulder, small silver stud earrings, no hat, no glasses, "
       "plain navy blue short-sleeved cotton dress under a white apron, her hands kept low)")
NATR = NAT.replace("her hands kept low)", f"{RING} on her right hand, her hands kept low)")  # desde i05 lleva el anillo
LEO = ("@{LEONEL_GARIBAY} (46-year-old Mexican man, light olive skin, long narrow face with hollow cheeks, receding hairline, short dark brown hair combed back and greying at the temples, "
       "thin black mustache, clean-shaven chin, thin gold-rimmed rectangular glasses, no hat, black suit, white shirt, thin black tie, "
       "his hands kept low, he never points a finger at anyone)")
IVO = ("@{IVONNE_GARIBAY} (42-year-old Mexican woman, fair skin, oval face with a sharp chin and thin arched eyebrows, dark red lipstick, "
       "shoulder-length dyed auburn hair pulled into a low tight bun, small pearl earrings and one single-strand pearl necklace, no hat, no glasses, "
       "black long-sleeved knee-length dress, her hands kept low)")
EFR = ("@{EFREN_SOTOMAYOR} (63-year-old Mexican man, light brown skin, round face with heavy jowls, bald on top with a short grey fringe on the sides, bushy grey eyebrows, "
       "clean-shaven, no hat, no glasses, dark brown suit, white shirt, brown tie, his hands kept low)")
NAZ = ("@{NAZARIO_QUEZADA} (56-year-old Mexican man, dark brown skin, square weathered face, deep-set dark eyes, grey crew cut, short full white beard, broad shoulders, "
       "no hat, no glasses, black suit with a black shirt buttoned to the collar and no tie, his hands crossed in front of him)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano. Nada de billetes a la vista.
FOLDER = "one brown leather folder held in his LEFT hand"
LETTER = "one folded cream letter held in both hands"
SEAL = "one cream envelope sealed with red wax"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / camionetas c28: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

NL = "standing on the LEFT near the open kitchen door"         # Nati
SR = "standing on the RIGHT"                                    # Leonel / Ivonne
EC = "standing beside the closed coffin in the middle of the courtyard"  # Efrén
NB = "standing in front of the stone arches at the back of the courtyard"  # Nazario

CLIPS = [
 # 1. Gancho (0-2 s): la caja con su ropa en el suelo; diez minutos y tres mil
 ("i01", 6, f"Close-up insert {PAT}: at the open kitchen door, a man's hand in a black suit sleeve drops one small cardboard box of folded clothes on the stone floor; "
            f"a folded white apron falls out of it. Only the hand and the box, no faces. No dialogue."),
 ("c01", 8, talk("c01", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, cold, he checks his wristwatch and then raises his eyes", "LEFT",
     NODOUBLE("man with glasses")), "cold, contemptuous, unhurried")),
 ("c02", 6, talk("c02", "Nati", one(f"Close-up of {NAT} {PAT}, {NL}, her eyes shine but her voice is steady", "RIGHT",
     NODOUBLE("woman in a white apron")), "hurt, quiet, dignified")),
 ("c03", 6, talk("c03", "Ivonne", one(f"Close-up of {IVO} {PAT}, {SR}, cold, her chin raised", "LEFT",
     NODOUBLE("woman in a black dress")), "cold, haughty")),
 ("c04", 6, talk("c04", "Nati", one(f"Close-up of {NAT} {PAT}, {NL}, firm, she wipes her hands on her apron", "RIGHT"),
     "firm, hurt, quiet")),
 ("r1", 6, one(f"Close-up of {LEO} {PAT}, {SR}, in silence, he adjusts his glasses and looks at her coldly", "LEFT") + " Slow push-in. No dialogue."),
 ("c05", 6, talk("c05", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, a thin cold smile", "LEFT",
     NODOUBLE("man with glasses")), "cold, smug")),
 ("i02", 6, f"Medium wide shot {PAT.replace('; no extras, nobody else in the courtyard besides the person described', '')}: twelve men in plain black suits and dark sunglasses "
            f"stand still in two rows in front of the stone arches, hands crossed in front of them, calm faces; nobody moves, no weapons. No dialogue."),
 ("c06", 6, talk("c06", "Ivonne", one(f"Close-up of {IVO} {PAT}, {SR}, she turns her head toward the back of the courtyard, giving an order", "LEFT"),
     "cold, bossy")),
 ("r2", 6, one(f"Close-up of {NAZ} {PAT}, {NB}, in silence, he does not move, his eyes fixed ahead", "RIGHT",
     NODOUBLE("man with a white beard")) + " Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Nazario", one(f"Close-up of {NAZ} {PAT}, {NB}, calm and still", "RIGHT",
     NODOUBLE("man with a white beard")), "calm, low, respectful, firm")),
 # 2. El licenciado y la carta del patrón
 ("i03", 6, f"Close-up insert {PAT}: hands in dark brown suit sleeves open one brown leather folder; inside lies {LETTER.replace(' held in both hands', '')}; "
            f"no readable text. Only the hands, no faces. No dialogue."),
 ("c08", 8, talk("c08", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, {FOLDER}, solemn", "RIGHT",
     NODOUBLE("bald man in a brown suit")), "solemn, calm, slow")),
 ("c09", 6, talk("c09", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, impatient, he adjusts his tie", "LEFT"),
     "impatient, cold")),
 ("c10", 8, talk("c10", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, {LETTER}, he reads from it with his eyes down, then looks up", "RIGHT"),
     "solemn, clear, slow, reading aloud")),
 ("i04", 6, f"Extreme close-up insert {PAT}: an older man's open hand in a dark brown suit sleeve shows {RING} resting in his palm; "
            f"white flowers and candlelight out of focus behind. No faces. No dialogue."),
 ("c11", 6, talk("c11", "Ivonne", one(f"Close-up of {IVO} {PAT}, {SR}, a short mocking laugh, then cold", "LEFT",
     NODOUBLE("woman in a black dress")), "mocking, cold")),
 ("c12", 6, talk("c12", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, dismissive, he waves one open hand toward the door", "LEFT"),
     "dismissive, cold")),
 ("r3", 6, one(f"Close-up of {NAT} {PAT}, {NL}, in silence, she looks down at {RING} in her open palm, her eyes shine", "RIGHT") + " Slow push-in. No dialogue."),
 # 3. Se pone el anillo y la escolta obedece
 ("i05", 6, f"Extreme close-up insert {PAT}: a woman's hand with a navy blue sleeve slowly slides {RING} onto her right ring finger; candlelight behind. "
            f"Only the hand, no faces. No dialogue."),
 # v1 (gafas oscuras + 'no weapons') y v2 (mourners + caja) fallaron por políticas -> v3 sin velorio ni caja, gesto amable
 ("i06", 6, "Medium wide shot in the sunny inner courtyard of an old Mexican hacienda at golden hour, ochre walls with stone arches, white flowers: "
            "a group of calm men in plain dark grey suits stand in two neat rows and politely nod toward an open wooden door on the left, friendly respectful faces. "
            "No text on screen. No dialogue."),
 ("c13", 6, talk("c13", "Nazario", one(f"Close-up of {NAZ} {PAT}, {NB}, he lowers his head slightly in respect", "LEFT",
     NODOUBLE("man with a white beard")), "respectful, low, firm")),
 ("c14", 6, talk("c14", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, surprised, he turns his head toward the back", "LEFT"),
     "surprised, upset")),
 ("c15", 6, talk("c15", "Nazario", one(f"Close-up of {NAZ} {PAT}, {NB}, calm, his eyes fixed", "RIGHT",
     NODOUBLE("man with a white beard")), "calm, firm, low")),
 ("c16", 6, talk("c16", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, {FOLDER}, serious", "RIGHT"),
     "serious, calm")),
 ("c17", 6, talk("c17", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, he takes off his glasses for a moment, shocked, then puts them back", "LEFT",
     NODOUBLE("man with glasses")), "shocked, upset")),
 ("c18", 6, talk("c18", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, {FOLDER}, calm, he closes the folder", "RIGHT"),
     "calm, firm")),
 ("c19", 6, talk("c19", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, he takes one step forward, his hand open and held out", "LEFT",
     NODOUBLE("man with glasses")), "upset, demanding")),
 ("i07", 6, f"Medium shot {PAT.replace('; no extras, nobody else in the courtyard besides the person described', '')}: two men in plain black suits and dark sunglasses step calmly "
            f"side by side in front of the open kitchen door, their backs to the camera, hands crossed; nobody touches anyone, no weapons. No dialogue."),
 ("c20", 6, talk("c20", "Nazario", one(f"Close-up of {NAZ} {PAT}, {NB}, very calm, his voice low", "RIGHT",
     NODOUBLE("man with a white beard")), "very calm, low, firm")),
 ("r4", 6, one(f"Close-up of {LEO} {PAT}, {SR}, in silence, he takes one small step back and adjusts his glasses, worried", "LEFT",
     NODOUBLE("man with glasses")) + " Slow push-in. No dialogue."),
 # 4. Momento cálido: ella lo cuidó al final
 ("c21", 6, talk("c21", "Ivonne", one(f"Close-up of {IVO} {PAT}, {SR}, indignant, her hand on her pearl necklace", "LEFT"),
     "indignant, upset")),
 ("c22", 6, talk("c22", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, his eyes sad, calm", "RIGHT",
     NODOUBLE("bald man in a brown suit")), "sad, calm, firm")),
 ("c23", 6, talk("c23", "Nati", one(f"Close-up of {NATR} {PAT}, {NL}, her eyes shine, a small sad smile", "RIGHT",
     NODOUBLE("woman in a white apron")), "tender, sad, quiet")),
 ("c24", 6, talk("c24", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, he turns toward her, warm", "LEFT"),
     "warm, quiet")),
 ("c25", 6, talk("c25", "Nati", one(f"Close-up of {NATR} {PAT}, {NL}, she looks down at her hand, sincere", "RIGHT"),
     "sincere, quiet")),
 # 5. Inversión a medias y cliffhanger (el castigo queda para la Parte 2)
 ("c26", 6, talk("c26", "Leonel", one(f"Close-up of {LEO} {PAT}, {SR}, a forced friendly smile, his hands open and low", "LEFT"),
     "suddenly friendly, nervous")),
 ("c27", 6, talk("c27", "Nati", one(f"Close-up of {NATR} {PAT}, {NL}, calm and firm, she raises her eyes", "RIGHT",
     NODOUBLE("woman in a white apron")), "calm, firm")),
 ("c28", 6, talk("c28", "Nazario", one(f"Close-up of {NAZ} {PAT}, {NB}, waiting for orders, calm", "LEFT",
     NODOUBLE("man with a white beard")), "calm, low, waiting for orders")),
 ("r5", 6, one(f"Close-up of {IVO} {PAT}, {SR}, in silence, she touches her pearl necklace, worried, glancing to the side", "LEFT") + " Slow push-in. No dialogue."),
 ("i08", 6, "Wide shot: at the entrance of an old Mexican hacienda at late afternoon, the tall old wooden gate closes slowly; two black SUVs with no logos parked inside; "
            "warm golden light, dust in the air; no people visible, no readable text. No dialogue."),
 ("c29", 6, talk("c29", "Nati", one(f"Close-up of {NATR} {PAT}, {NL}, she glances toward the coffin, serene", "RIGHT"),
     "serene, firm, quiet")),
 ("c30", 6, talk("c30", "Nati", one(f"Close-up of {NATR} {PAT}, {NL}, she looks back at them, calm and firm", "RIGHT",
     NODOUBLE("woman in a white apron")), "calm, firm, unhurried")),
 ("r6", 6, one(f"Close-up of {LEO} {PAT}, {SR}, in silence, he swallows and looks at the ground, his jaw tight", "LEFT") + " Slow push-in. No dialogue."),
 ("c31", 6, talk("c31", "the lawyer", one(f"Close-up of {EFR} {PAT}, {EC}, he holds out {SEAL} with his RIGHT hand, his voice low", "LEFT",
     NODOUBLE("bald man in a brown suit")), "low, discreet, serious")),
 ("i09", 6, f"Extreme close-up insert {PAT}: a woman's hand wearing {RING} holds {SEAL}; no readable text. Only the hand, no faces. No dialogue."),
 # CTA con carisma (después del BLACK): Nati sola en la cocina, a cámara
 ("c32", 10, talk("c32", "Nati", f"Medium close-up of {NATR} {COC}, alone, standing beside the long wooden table, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she turns the gold ring on her finger, tilts her head, raises her eyebrows, nods and smiles a little. "
     f"Nobody else in the kitchen.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly"), ("brake hard", "stop")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("controlled", "calm"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("holds firmly", "rests on"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("wake", "family gathering"), ("Tienes diez minutos para largarte, muchacha.", "Tienes diez minutos para irte, muchacha."),
        ("Nazario, sáquenla de la casa.", "Nazario, acompáñenla a la puerta."), ("Pero te me vas ahorita.", "Pero te vas ahorita."),
        ("Un paso más, joven.", "Hasta ahí, joven."), ("Y el que sale de aquí es usted.", "Y el que se va es usted."),
        ("¿Los sacamos de la hacienda?", "¿Los acompañamos a la puerta?"), ("Dame ese anillo ahorita, muchacha.", "Ese anillo, muchacha, por favor.")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the inner courtyard of an old Mexican hacienda at golden hour, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{NATI_CERVERA}", "a Mexican cook"), ("@{LEONEL_GARIBAY}", "a Mexican man in mourning"),
         ("@{IVONNE_GARIBAY}", "a Mexican woman in mourning"), ("@{EFREN_SOTOMAYOR}", "a Mexican lawyer"),
         ("@{NAZARIO_QUEZADA}", "a Mexican head of security"),
         (" @{LOC_PATIOVELORIO}", ""), (" @{LOC_COCINAGARIBAY}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END, NOSUB y CLEAN quedan, van después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:  # entorno explícito y tope de 10 min por llamada (flow.js ya corta a los 90 s por video)
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control (regla del usuario): si un clip falla, generar algo neutro para saber si falla el prompt o Flow."""
    # gatito como IMAGEN (no gasta créditos; el video costaba 12-15 por prueba)
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
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1  # regenerar: guardar la versión anterior
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            files, log = gen(variant(body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"  # MP4 que no decodifica: reintentar
            # QA velorio: Flow devolvió el video ANTERIOR en 6 clips (md5 igual a otro clip) -> se trata como fallo
            if files:
                h = hashlib.md5(Path(files[0]).read_bytes()).hexdigest()
                if any(hashlib.md5(p.read_bytes()).hexdigest() == h for p in OUT.glob("*.mp4") if p.resolve() != Path(files[0]).resolve()):
                    os.remove(files[0]); files, log = [], "DUPLICADO (Flow devolvió un video anterior)"
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()  # Flow no se desbloquea esperando: recargar la página
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0  # recargar no bastó: proyecto nuevo + volver a subir hojas
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()
