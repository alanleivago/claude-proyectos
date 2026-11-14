"""Genera los clips de masa-honrada PARTE 1 (La Masa Honrada, video 26, remake de la ref 7682590215994690849 de @solreflection, SINMARCA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / buen-hijo-p2 c27 / mecanico c25 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25 / sazon-concha c16: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c13 / regreso-20 c28: frase repetida al final -> silencio tras la última palabra; QA regreso-20 c14/c22: 2ª frase perdida -> 8 s para dos frases
END = "After the last word the person stays silent until the end of the shot."
# Regla camionero v1: TODOS los planos son de una sola persona (ONE + ALONE) con la mirada a un lado SIN nombrar al otro (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26: nadie entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Puesto de Yesenia (c01, c03-c05, r1, c09, c17-c21, c25-c27, r4): Yesenia a la DERECHA detrás de su mesa de acero; Rigo, Chayo y (al otro lado de la banqueta) Lupe a la IZQUIERDA.
#   Carrito de Lupe (c02, c06-c08, c10-c12, r2, c22-c24, c28-c33, r5): Lupe a la IZQUIERDA detrás de su comal; Toña, Chayo y Yesenia a la DERECHA.
#   Patio de los Zamudio de noche (c13-c16, r3): Chayo a la IZQUIERDA, Abundio a la DERECHA, sentados a la mesa.
#   CTA (c34): Lupe sola en su carrito, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin precios, sin marcas, sin adornos.
YST = ("at the sidewalk tortilla stall @{LOC_PUESTOYESE} in a Mexican neighborhood in the morning: a plain dark grey canvas awning, one stainless steel table, "
       "one big yellow plastic tub of pale dough, a plain pale orange house wall behind; soft natural daylight; no readable text, no signs, no prices, no logos; "
       "no extras, nobody else on the sidewalk besides the person described")
YSTA = YST.replace("in the morning", "in the late afternoon").replace("soft natural daylight", "warm low afternoon light, the stall quiet and empty of customers")
LST = ("at the sidewalk tortilla stand @{LOC_COMALLUPE} in a Mexican neighborhood in the morning: one old wooden cart with a round black comal griddle, "
       "a stack of warm tortillas wrapped in a plain white cloth, a plain pale blue house wall behind; soft natural daylight with light steam from the comal; "
       "no readable text, no signs, no prices, no logos; no extras, nobody else on the sidewalk besides the person described")
LSTA = LST.replace("in the morning", "in the late afternoon").replace("soft natural daylight", "warm low afternoon light")
PAT = ("in the small home patio @{LOC_PATIOZAMUDIO} at night: one plain wooden table with simple white plates, one small basket of tortillas, one clay bowl of red salsa, "
       "one clear glass water jug, a plain whitewashed wall, one bare warm light bulb above; no bottles with labels, no readable text, no decorations; "
       "no extras, nobody else in the patio besides the person described")
# Anclas de identidad y ropa (atuendos de la ref con otros colores: la tortillera de mandil oscuro sobre blusa clara; la rival de blusa fucsia, mandil negro, jeans y chongo;
# el empleado de playera gris y mandil negro; la clienta de blusa lila y pantalón negro). NADIE lleva sombrero, gorra, red de pelo ni lentes.
# Manos abiertas, nadie señala con el dedo (QA canasta c18). Sin uniformes, gafetes ni letras en la ropa. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
LUPE = ("@{LUPE_OLVERA} (60-year-old Mexican woman, brown skin, warm dignified face with soft lines, long grey hair in one braid over her shoulder, no hat, no glasses, "
        "pale yellow short-sleeved blouse under a plain maroon apron, small silver stud earrings, a little corn dough dust on her hands, her hands kept low and open)")
YES = ("@{YESENIA_BARRAGAN} (42-year-old Mexican woman, light brown skin, sharp proud face, dark burgundy-dyed hair pulled up in a high bun, no hat, no glasses, "
       "bright turquoise short-sleeved blouse under a plain charcoal grey apron, blue jeans, small gold hoop earrings, her hands kept low, she never points a finger at anyone)")
RIGO = ("@{RIGO_MOLINERO} (28-year-old Mexican man, brown skin, honest worried face, short black hair, thin black moustache, no hat, no glasses, "
        "plain olive green t-shirt under a plain navy blue apron, his hands open)")
CHAYO = ("@{CHAYO_ZAMUDIO} (55-year-old Mexican woman, brown skin, round expressive face, shoulder-length wavy black hair, no hat, no glasses, "
         "coral orange short-sleeved blouse, dark blue trousers, her hands kept low, she never points a finger at anyone)")
ABU = ("@{ABUNDIO_ZAMUDIO} (58-year-old Mexican man, brown skin, kind tired face, short grey hair, grey stubble, no hat, no glasses, "
       "blue and white checked short-sleeved shirt, his hands open)")
TONA = ("@{TONA_VECINA} (62-year-old Mexican woman, light brown skin, cheerful frank face, short curly salt-and-pepper hair, no hat, no glasses, "
        "mustard yellow knitted cardigan over a plain white blouse, her hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
SACK = "one plain white paper sack of flour with no printing on it"
TORT = "one broken tortilla held in her RIGHT hand"
PHONE = "one black smartphone held low in her RIGHT hand, its screen turned away from the camera"
CORN = "her hands rinsing soaked yellow corn kernels in one plain blue plastic tub of water"
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

CLIPS = [
 # 1. Gancho / amenaza (puesto de Yesenia, mañana): Yesenia habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Yesenia", one(f"Close-up of {YES} {YST}, standing on the RIGHT behind her steel table, a confident smug smile, chin up", "LEFT",
     NODOUBLE("woman in a turquoise blouse")), "smug, provoking, playful")),
 ("c02", 8, talk("c02", "Lupe", one(f"Close-up of {LUPE} {LST}, standing on the LEFT behind her wooden cart with the comal, calm and dignified, a small serene smile", "RIGHT",
     NODOUBLE("woman in a maroon apron")), "calm, dignified, wise")),
 # 2. El truco a la vista (solo el espectador lo ve)
 ("c03", 8, talk("c03", "Yesenia", one(f"Close-up of {YES} {YST}, standing on the RIGHT behind her steel table, {SACK} on the table next to the tub, she lowers her voice, sly", "LEFT"),
     "sly, quiet, bossy")),
 ("c04", 8, talk("c04", "Rigo", one(f"Close-up of {RIGO} {YST}, standing on the LEFT at the steel table, his hands in the pale dough in the yellow tub, he looks up, doubtful", "RIGHT",
     NODOUBLE("man in a navy apron")), "doubtful, quiet, worried")),
 ("c05", 8, talk("c05", "Yesenia", one(f"Close-up of {YES} {YST}, standing on the RIGHT, she waves one open hand lightly, impatient", "LEFT"),
     "impatient, dismissive, cold")),
 ("r1", 6, one(f"Close-up of {RIGO} {YST}, standing on the LEFT at the steel table, in silence, he presses the pale watery dough in the yellow tub and frowns at it", "RIGHT") + " Slow push-in. No dialogue."),
 # 3. La injusticia (carrito de Lupe, mañana): se le van los clientes
 ("c06", 8, talk("c06", "Toña", one(f"Close-up of {TONA} {LST}, standing on the RIGHT next to the cart, worried, she glances to the side down the street", "LEFT",
     NODOUBLE("woman in a mustard cardigan")), "worried, frank, warm")),
 ("c07", 8, talk("c07", "Lupe", one(f"Close-up of {LUPE} {LST}, standing on the LEFT behind her cart, she turns a tortilla on the comal with her fingers, calm and firm", "RIGHT"),
     "calm, firm, proud")),
 ("c08", 6, talk("c08", "Chayo", one(f"Close-up of {CHAYO} {LST}, standing on the RIGHT in front of the cart, a friendly smile", "LEFT",
     NODOUBLE("woman in a coral blouse")), "friendly, warm, cheerful")),
 ("c09", 8, talk("c09", "Yesenia", one(f"Close-up of {YES} {YST}, standing on the RIGHT behind her table, she calls out across the street with a big sweet smile, one open hand waving", "LEFT"),
     "sweet, loud, persuasive")),
 ("c10", 8, talk("c10", "Chayo", one(f"Close-up of {CHAYO} {LST}, standing on the RIGHT, a guilty little smile, she shrugs", "LEFT"),
     "guilty, light, apologetic")),
 ("c11", 6, talk("c11", "Lupe", one(f"Close-up of {LUPE} {LST}, standing on the LEFT behind her cart, a kind small smile, she nods once", "RIGHT"),
     "kind, calm, gentle")),
 ("r2", 6, one(f"Close-up of {LUPE} {LST}, standing on the LEFT behind her cart, in silence, she watches someone walk away, her smile fades, she breathes slowly", "RIGHT") + " Slow push-in. No dialogue."),
 # 4. El principio moral
 ("c12", 8, talk("c12", "Lupe", one(f"Close-up of {LUPE} {LST}, standing on the LEFT behind her cart, serious and sincere, one hand resting on the cloth of tortillas", "RIGHT"),
     "sincere, serious, warm")),
 # 5. El primer castigo (patio de los Zamudio, de noche)
 ("c13", 6, talk("c13", "Abundio", one(f"Close-up of {ABU} {PAT}, sitting on the RIGHT at the table, he lifts one tortilla close to his nose and smells it, puzzled", "LEFT",
     NODOUBLE("man in a checked shirt")), "puzzled, curious, calm")),
 ("c14", 6, talk("c14", "Chayo", one(f"Close-up of {CHAYO} {PAT}, sitting on the LEFT at the table, a proud little smile", "RIGHT"),
     "proud, light, cheerful")),
 ("c15", 8, talk("c15", "Abundio", one(f"Close-up of {ABU} {PAT}, sitting on the RIGHT at the table, he tears one tortilla and it crumbles, he shakes his head", "LEFT"),
     "disappointed, frank, calm")),
 ("c16", 8, talk("c16", "Chayo", one(f"Close-up of {CHAYO} {PAT}, sitting on the LEFT at the table, {TORT}, upset, she looks at it and sighs", "RIGHT",
     NODOUBLE("woman in a coral blouse")), "upset, decided, frank")),
 ("r3", 6, one(f"Close-up of {CHAYO} {PAT}, sitting on the LEFT at the table, in silence, {TORT}, it breaks in two, she frowns", "RIGHT") + " Slow push-in. No dialogue."),
 # 6. La confrontación (puesto de Yesenia, a la mañana siguiente)
 ("c17", 8, talk("c17", "Chayo", one(f"Close-up of {CHAYO} {YST}, standing on the LEFT in front of the steel table, {TORT}, serious and annoyed", "RIGHT",
     NODOUBLE("woman in a coral blouse")), "annoyed, firm, frank")),
 ("c18", 6, talk("c18", "Yesenia", one(f"Close-up of {YES} {YST}, standing on the RIGHT behind her table, a confident smile, she shrugs", "LEFT"),
     "confident, dismissive, sweet")),
 ("c19", 10, talk("c19", "Chayo", one(f"Close-up of {CHAYO} {YST}, standing on the LEFT, she raises her eyebrows, firm, chin up", "RIGHT"),
     "firm, annoyed, decided")),
 ("c20", 6, talk("c20", "Yesenia", one(f"Close-up of {YES} {YST}, standing on the RIGHT behind her table, a nervous sweet smile, her open hands raised a little", "LEFT",
     NODOUBLE("woman in a turquoise blouse")), "nervous, sweet, forced")),
 ("c21", 6, talk("c21", "Chayo", one(f"Close-up of {CHAYO} {YST}, standing on the LEFT, {PHONE}, she types with her thumb, decided, a small satisfied smile", "RIGHT"),
     "decided, calm, satisfied")),
 # 7. La reivindicación (carrito de Lupe; entra la cama cálida)
 ("c22", 8, talk("c22", "Toña", one(f"Close-up of {TONA} {LST}, standing on the RIGHT next to the cart, proud and warm, she nods", "LEFT"),
     "proud, warm, firm")),
 ("c23", 8, talk("c23", "Chayo", one(f"Close-up of {CHAYO} {LST}, standing on the RIGHT in front of the cart, ashamed, a humble smile, one hand on her chest", "LEFT",
     NODOUBLE("woman in a coral blouse")), "ashamed, humble, sincere")),
 ("c24", 8, talk("c24", "Lupe", one(f"Close-up of {LUPE} {LST}, standing on the LEFT behind her cart, a warm generous smile, she turns a tortilla on the comal", "RIGHT"),
     "warm, generous, calm")),
 # 8. El castigo de la villana (puesto de Yesenia vacío, tarde)
 ("c25", 8, talk("c25", "Rigo", one(f"Close-up of {RIGO} {YSTA}, standing on the LEFT at the steel table, serious, he glances toward the empty street", "RIGHT"),
     "serious, quiet, worried")),
 ("c26", 6, talk("c26", "Yesenia", one(f"Close-up of {YES} {YSTA}, standing on the RIGHT behind her table, arms crossed, proud and bitter", "LEFT",
     NODOUBLE("woman in a turquoise blouse")), "bitter, proud, dismissive")),
 # QA c27 v1: repitió "la gente de aquí" (2.54-3.58 s) + hombro de playera verde olivo (doble) en el borde DER. 0-1.25 s -> manos quietas en la mesa desde el 1er intento, sin tartamudeo, NODOUBLE de la playera
 ("c27", 8, talk("c27", "Rigo", one(f"Close-up of {RIGO} {YSTA}, standing on the LEFT, calm and firm, both hands resting still on the steel table the whole time", "RIGHT",
     NODOUBLE("man in an olive green t-shirt or navy apron, no green sleeve or shoulder")), "calm, firm, tired, steady and clear, no stutter, every word said once, he never repeats a phrase")),
 ("r4", 6, one(f"Close-up of {YES} {YSTA}, standing alone on the RIGHT behind her table, in silence, she looks at the empty street, her proud face falls", "LEFT") + " Slow push-in. No dialogue."),
 # 9. La redención (carrito de Lupe, tarde)
 ("c28", 8, talk("c28", "Yesenia", one(f"Close-up of {YES} {LSTA}, standing on the RIGHT in front of the cart, humble, her eyes shine, her hands held together low", "LEFT",
     NODOUBLE("woman in a turquoise blouse")), "humble, sad, pleading")),
 ("c29", 8, talk("c29", "Lupe", one(f"Close-up of {LUPE} {LSTA}, standing on the LEFT behind her cart, calm, a small wise smile, she nods toward the side", "RIGHT"),
     "calm, wise, a little ironic")),
 ("c30", 6, talk("c30", "Yesenia", one(f"Close-up of {YES} {LSTA}, standing on the RIGHT, a grateful small smile, she nods", "LEFT"),
     "grateful, soft, sweet")),
 # 10. Gancho para la Parte 2 (vuelve el suspenso)
 ("c31", 8, talk("c31", "Yesenia", one(f"Close-up of {YES} {LSTA}, standing alone on the RIGHT beside the cart, {CORN}, she whispers to herself with a sly smile, eyes sliding to the side", "LEFT",
     NODOUBLE("woman in a turquoise blouse")), "whispering, sly, quiet")),
 ("c32", 6, talk("c32", "Toña", one(f"Close-up of {TONA} {LSTA}, standing on the RIGHT next to the cart, worried, she speaks low", "LEFT",
     NODOUBLE("woman in a mustard cardigan")), "worried, quiet, urgent")),
 ("c33", 8, talk("c33", "Lupe", one(f"Close-up of {LUPE} {LSTA}, standing on the LEFT behind her cart, calm, a small knowing smile, she keeps turning a tortilla on the comal", "RIGHT"),
     "calm, knowing, sly")),
 ("r5", 6, one(f"Close-up of {LUPE} {LSTA}, standing on the LEFT behind her cart, in silence, she glances to the side with a calm knowing look and a tiny smile", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Lupe en su carrito, a cámara
 # QA c34 v1: dijo otra frase inventada ("No visualices el dinero, visualiza el bienestar...") y la trenza cambió al hombro izquierdo -> solo las 2 líneas citadas, palabra por palabra; trenza sobre el hombro DERECHO
 ("c34", 10, talk("c34", "Lupe", f"Medium close-up of {LUPE} {LSTA}, her grey braid over her RIGHT shoulder, alone behind her wooden cart, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she wipes her hands on her apron, tilts her head, raises her eyebrows, nods and smiles. "
     f"Nobody else on the sidewalk. She says only the two Spanish lines quoted below, word for word, about Yesenia and the second part, and no other words or phrases.",
     "warm, charismatic, a little playful, talking directly to the viewer, exactly the quoted words")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("calls out across the street", "speaks"), ("disbelieving", "surprised"),
        ("defensive", "serious"), ("bossy", "firm"), ("provoking", "confident"), ("sly", "calm"), ("whispering", "speaking softly"), ("whispers", "speaks softly"),
        ("ashamed", "humble"), ("guilty", "shy"), ("forced", "small"), ("nervous", "quiet"), ("pleading", "soft"), ("bitter", "serious"),
        ("dismissive", "calm"), ("disappointed", "serious"), ("crumbles", "tears apart"), ("breaks in two", "tears softly"),
        ("smells it", "looks at it"), ("arms crossed", "hands low"), ("unties his navy apron slowly", "rests his hands on the table"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("cold", "serious"), ("arrogant", "proud"), ("indignant", "serious"), ("uneasy", "quiet"),
        ("¡", ""), ("!", "."), ("le quito hasta al perro", "me quedo con su clientela"), ("A mí no me ve la cara", "A mí no me engaña"),
        ("harina corriente", "harina barata"), ("Pura envidia de esa señora", "Son cosas de esa señora")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, two tortilla stands on a sidewalk of a Mexican neighborhood, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican neighborhood drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{LUPE_OLVERA}", "a Mexican tortilla maker"), ("@{YESENIA_BARRAGAN}", "a Mexican street vendor"),
         ("@{RIGO_MOLINERO}", "a Mexican stall helper"), ("@{CHAYO_ZAMUDIO}", "a Mexican neighbor"),
         ("@{ABUNDIO_ZAMUDIO}", "a Mexican man"), ("@{TONA_VECINA}", "a Mexican neighbor lady"),
         (" @{LOC_PUESTOYESE}", ""), (" @{LOC_COMALLUPE}", ""), (" @{LOC_PATIOZAMUDIO}", "")]
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
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()  # Flow no se desbloquea esperando: recargar la página
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                reload_flow(); time.sleep(20); continue  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()
