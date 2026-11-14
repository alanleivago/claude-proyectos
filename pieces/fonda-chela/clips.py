"""Genera los clips de fonda-chela PARTE 1 (El Jefe Nuevo, historia propia tipo CAPOS, premisa 1 de fuentes/atrium-vista/resumen.md, VISTA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Regla camionero v1: TODOS los planos hablados son de una sola persona (ONE + ALONE) con la mirada a un lado SIN nombrar al otro (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26: nadie entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Fórmula capos (resumen atrium-vista): gancho visual en 0-2 s (camionetas cerrando la calle + Tavo sujetado del hombro) con cifra y plazo (50 mil antes del domingo);
# poder SIN armas: escoltas de manos cruzadas, convoy, radio, anillo, maletín cerrado. Insertos i* sin caras y reacciones mudas r* para el ritmo de <=2 s por plano.
# Geografía fija (solo define hacia dónde mira cada uno):
#   Mostrador de la fonda (c01-c13, r1): Chela a la IZQUIERDA detrás del mostrador; Saúl a la DERECHA de pie frente al mostrador;
#     el Güero (Rolando) junto a la puerta, mira a la IZQUIERDA hacia Saúl; Tavo a la DERECHA, mira a la IZQUIERDA hacia su tía.
#   Mesa del fondo (c14-c29, c31-c33, c35, r2, r3, r5): Saúl de pie a la IZQUIERDA; Macario sentado a la DERECHA a la mesa del fondo; el Güero en la puerta mira a la IZQUIERDA.
#   c30, c34, r4: Chela en el mostrador mira a la DERECHA hacia el fondo; Tavo junto a ella mira a la IZQUIERDA. CTA (c36): Chela sola en el mostrador, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin menús, sin marcas, sin adornos.
FON = ("inside the small humble fonda @{LOC_FONDACHELA} in the morning: plain whitewashed walls, one simple wooden counter with one big brown clay pot on it, "
       "a few plain wooden tables and chairs, one open door to a sunny dusty street; warm golden morning light; no readable text, no menu boards, no signs, no logos, no calendar; "
       "no extras, nobody else in the fonda besides the person described")
CAL = ("on the dusty street @{LOC_CALLEFONDA} of a small Mexican town in the morning: plain adobe houses painted in faded colors, the open door of a small fonda; "
       "warm golden morning light, dust in the air; no readable text, no signs, no logos, no license plates")
# Anclas de identidad y ropa. Solo Macario lleva sombrero y bigote; solo Saúl barba; solo el Güero es rubio. Nadie con lentes. Manos abiertas, nadie señala con el dedo.
# Sin uniformes, gafetes ni letras en la ropa. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
RING = "one heavy gold ring with a flat black stone on his right hand"
CHE = ("@{CHELA_VILLEGAS} (66-year-old Mexican woman, brown skin, round calm face with kind deep lines, grey hair in a low bun, small gold earrings, no hat, no glasses, "
       "lilac cotton blouse under a plain white apron, her hands kept low)")
TAV = ("@{TAVO_VILLEGAS2} (24-year-old Mexican man, clearly an adult, light brown skin, thin nervous face, short black hair, clean-shaven, no hat, no glasses, "
       "plain white short-sleeved shirt, a small black waiter's apron at the waist, his hands kept low)")
SAU = ("@{SAUL_BETANCOURT2} (40-year-old Mexican man, fair skin, cocky sharp face, slicked-back black hair, short trimmed black beard, no hat, no glasses, "
       "charcoal grey suit with an open-collar black shirt, no tie, one silver wristwatch, his hands kept low, he never points a finger at anyone)")
GUE = ("@{ROLANDO_GUERO2} (35-year-old Mexican man, light brown skin, wide round face, thick dark eyebrows, bleached blond buzz cut with dark roots, thin dark goatee, no hat, no glasses, "
       "black leather jacket over a plain black t-shirt, his hands kept low)")
MAC = ("@{MACARIO_LEDESMA2} (74-year-old Mexican man, tan weathered skin, serene stern face, thick white mustache, grey felt cowboy hat, no glasses, "
       f"cream guayabera shirt, {RING}, his hands calm on the table)")
# QA fonda-chela 2026-11-07: la hoja ROLANDO_GUERO2 salió igual a Saúl (pelo negro, barba, traje gris) -> c06/c22 sin esa hoja y con el rubio bien anclado
GUE2 = ("a Mexican bodyguard (35-year-old Mexican man, light skin, broad serious face, very short bleached BLOND buzz cut, NOT black hair, NOT slicked back, "
        "clean-shaven with no beard, no hat, no glasses, black leather jacket over a plain black t-shirt, NOT a suit, his hands kept low)")
# QA c12 (camiseta sin cuello) / c34 (sin camisa): misma camisa que r1 y la hoja
TAVS = TAV.replace("plain white short-sleeved shirt", "plain white short-sleeved button-up shirt with a collar and a chest pocket, fully buttoned, worn the whole time (never shirtless, never a t-shirt)")
# QA c08/c28 (salieron sin hoja, intento 5): saco gris carbón oscuro, no gris claro ni beige
SAUC = SAU.replace("charcoal grey suit", "dark charcoal grey suit (the jacket is dark, not light grey, not beige)")
NOBOARD = "plain whitewashed walls with no chalkboards, no menus, no frames, nothing written anywhere"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11). El maletín siempre CERRADO (nada de fajos a la vista).
MUG = "one brown clay mug of café de olla"
MUGH = "one brown clay mug of café de olla held in his RIGHT hand"
RADIO = "one black handheld radio held low in his RIGHT hand"
CASE = "one closed black leather briefcase"
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

CNT = "standing behind the wooden counter on the LEFT"      # Chela
BAR = "standing on the RIGHT in front of the wooden counter"  # Saúl en el mostrador
BCK = "standing on the LEFT beside the plain wooden table at the back of the fonda"  # Saúl en la mesa del fondo
SEAT = "seated alone on the RIGHT at the plain wooden table at the back of the fonda, a plate of chilaquiles in front of him"  # Macario
DOOR = "standing by the open door of the fonda"  # Güero

CLIPS = [
 # 1. Gancho (0-2 s): camionetas cerrando la calle, Saúl pone precio y plazo, Tavo sujetado del hombro
 ("i01", 6, f"Wide shot {CAL}: three black SUVs with no logos brake hard one behind the other in front of the small fonda, raising a cloud of dust and closing the street. "
            f"No people visible. No dialogue."),
 ("c01", 8, talk("c01", "Saúl", one(f"Close-up of {SAU} {FON}, {BAR}, he places one open hand flat on the counter, a cold confident smile", "LEFT",
     NODOUBLE("man in a charcoal grey suit")), "cold, confident, unhurried")),
 ("i02", 6, f"Close-up insert {FON}: a big man's hand in a black leather jacket sleeve holds firmly the shoulder of a plain white short-sleeved shirt; "
            f"only the hand, the shoulder and part of a small black waiter's apron are visible, no faces. No dialogue."),
 ("c02", 6, talk("c02", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, calm and firm, she does not move", "RIGHT",
     NODOUBLE("woman in a white apron")), "calm, firm, quiet")),
 ("c03", 6, talk("c03", "Saúl", one(f"Close-up of {SAU} {FON}, {BAR}, he leans a little toward the counter, smug", "LEFT"),
     "smug, slow, cold")),
 ("r1", 6, one(f"Close-up of {TAV} {FON}, standing on the RIGHT near the counter, in silence, he rubs his own shoulder with his left hand, worried, he glances toward the door", "LEFT") + " Slow push-in. No dialogue."),
 ("c04", 8, talk("c04", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she wipes the counter slowly with a white cloth, calm, she raises her eyes", "RIGHT"),
     "calm, curious, dignified")),
 ("c05", 6, talk("c05", "Saúl", one(f"Close-up of {SAU} {FON}, {BAR}, a dismissive smile", "LEFT"),
     "dismissive, proud")),
 ("c06", 6, talk("c06", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, {DOOR}, the sunny street behind him, serious", "LEFT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "serious, low, waiting for orders")),
 ("i03", 6, f"Medium wide shot {CAL}: four men in plain black suits and dark sunglasses stand still in a row beside three black SUVs, hands crossed in front of them, "
            f"calm faces; nobody moves, no weapons. No dialogue."),
 # 2. El café: Chela no se asusta y lo manda a la mesa del fondo
 ("c07", 8, talk("c07", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she pours coffee from the big clay pot into {MUG} on the counter, calm, a small polite smile", "RIGHT"),
     "calm, warm, polite")),
 ("c08", 8, talk("c08", "Saúl", one(f"Close-up of {SAUC} {FON}, {BAR}, a short amused smile, then serious", "LEFT",
     NODOUBLE("man in a charcoal grey suit")), "amused, surprised, then serious, no laughing")),
 ("c09", 6, talk("c09", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she slides {MUG} across the counter toward him, she glances toward the back of the room", "RIGHT"),
     "calm, firm, quiet")),
 ("c10", 6, talk("c10", "Saúl", one(f"Close-up of {SAU} {FON}, {BAR}, offended, he frowns", "LEFT"),
     "offended, annoyed")),
 ("c11", 6, talk("c11", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, serene, the hint of a knowing smile", "RIGHT"),
     "serene, quiet, knowing")),
 ("i04", 6, f"Extreme close-up insert {FON}: on a plain wooden table at the back, an old man's hand in a cream guayabera sleeve with {RING} rests calmly beside a plate of chilaquiles; "
            f"no faces, no cup on the table. No dialogue."),
 ("c12", 6, talk("c12", "Tavo", one(f"Close-up of {TAVS} {FON}, standing on the RIGHT near the counter, worried, he speaks low", "LEFT",
     NODOUBLE("young man in a white shirt")), "worried, a whisper")),
 ("c13", 6, talk("c13", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she looks at her nephew with calm confidence", "RIGHT"),
     "calm, sure, tender")),
 # 3. La mesa del fondo: Saúl le cobra al viejo sin saber quién es
 ("c14", 8, talk("c14", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, {MUGH}, he sets it down on the table with a cocky smile", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")), "cocky, mocking")),
 ("r2", 6, one(f"Close-up of {MAC} {FON}, {SEAT}, in silence, he keeps eating calmly and does not look up", "LEFT",
     NODOUBLE("old man in a grey felt hat")) + " Slow push-in. No dialogue."),
 ("c15", 6, talk("c15", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, irritated, he leans toward the table", "RIGHT"),
     "irritated, mocking")),
 ("c16", 8, talk("c16", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he stirs {MUG} slowly with a spoon and still does not look up, very calm", "LEFT",
     NODOUBLE("old man in a grey felt hat")), "very calm, low, slow, the one who is in charge")),
 ("c17", 8, talk("c17", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, offended, his smile hard", "RIGHT"),
     "offended, threatening, proud")),
 ("c18", 6, talk("c18", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, a slow small smile under his white mustache", "LEFT"),
     "amused, calm, low")),
 # 4. El convoy: llegan siete camionetas que no son de Saúl
 ("i05", 6, f"Close-up insert {FON}: a hand in a black leather jacket sleeve lifts {RADIO.replace(' held low in his RIGHT hand', '')} near the open door, its small light blinking; "
            f"only the hand and the radio, no faces. No dialogue."),
 ("c19", 6, talk("c19", "the Güero", one(f"Close-up of {GUE} {FON}, {DOOR}, {RADIO}, worried, he looks out to the street and back", "LEFT"),
     "worried, quick, low")),
 ("i06", 6, f"Aerial drone shot over the dusty street @{{LOC_CALLEFONDA}} of a small Mexican town in the morning: seven black SUVs with no logos arrive in a line raising dust "
            f"and park around three other black SUVs in front of a small fonda, closing both ends of the street. No people visible. No dialogue."),
 ("c20", 6, talk("c20", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, he turns his head to the door and back, nervous", "RIGHT"),
     "nervous, surprised")),
 ("c21", 8, talk("c21", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he finally raises his eyes, calm and hard", "LEFT"),
     "calm, hard, low")),
 ("c22", 6, talk("c22", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, {DOOR}, he lowers his eyes, worried, he speaks low", "LEFT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "worried, a whisper")),
 ("r3", 6, one(f"Close-up of {SAU} {FON}, {BCK}, in silence, he looks down at the old man's hand on the table, his cocky smile fades, he swallows", "RIGHT") + " Slow push-in. No dialogue."),
 # 5. La inversión: Macario le dio el pueblo; plazo = lo que dura el café
 ("c23", 8, talk("c23", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, worried, his voice low, his hands open and low", "RIGHT"),
     "worried, respectful, quiet")),
 ("c24", 8, talk("c24", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, calm, his eyes fixed", "LEFT"),
     "calm, cold, slow")),
 ("c25", 8, talk("c25", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he taps the table once with two fingers, serious", "LEFT"),
     "serious, disappointed, low")),
 ("c26", 6, talk("c26", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, worried, he nods quickly", "RIGHT"),
     "worried, quick, pleading")),
 ("c27", 6, talk("c27", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he looks straight at him, still", "LEFT"),
     "calm, hard, quiet")),
 ("c28", 6, talk("c28", "Saúl", one(f"Close-up of {SAUC} {FON}, {BCK}, {NOBOARD}, he looks down at the table, quiet, his hands open and low", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")), "quiet, sincere, low")),
 ("c29", 8, talk("c29", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, the open door far behind him on the RIGHT of the frame, he lifts {MUG} and takes one slow sip", "LEFT",
     NODOUBLE("old man in a grey felt hat")), "calm, unhurried, low").replace("Ve sacando el maletín.", "Ve trayendo el maletín.")),
 ("i07", 6, f"Close-up insert {FON}: hands in black leather jacket sleeves set {CASE} on a plain wooden table beside {MUG}; the briefcase stays closed the whole time. "
            f"Only the hands, no faces. No dialogue."),
 # 6. Momento cálido: el fiado de hace treinta años; Chela decide
 ("c30", 6, talk("c30", "Chela", one(f"Close-up of {CHE} {FON}, standing behind the wooden counter, she looks toward the back of the fonda, calm and tired", "RIGHT"),
     "calm, tired, sincere")),
 ("c31", 8, talk("c31", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he turns his face toward the counter, his eyes soft, a warm small smile", "LEFT"),
     "warm, grateful, low")),
 ("c32", 6, talk("c32", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, serious again, he waits", "LEFT"),
     "serious, calm")),
 ("r4", 6, one(f"Close-up of {CHE} {FON}, standing behind the wooden counter, in silence, she looks toward the back of the fonda, thinking, her jaw firm", "RIGHT") + " Slow push-in. No dialogue."),
 # 7. Súplica, cuenta atrás y dilema (el castigo queda para la Parte 2)
 ("c33", 6, talk("c33", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, he turns toward the counter, pleading, his hands open and low", "RIGHT"),
     "pleading, worried, quiet")),
 ("c34", 6, talk("c34", "Tavo", one(f"Close-up of {TAVS} {FON}, standing on the RIGHT near the counter, upset, fully dressed, he rests his right hand on the shoulder of his white shirt", "LEFT",
     NODOUBLE("young man in a white shirt")), "upset, hurt, firm")),
 ("c35", 8, talk("c35", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he sets down the empty {MUG.replace('one ', '')} and looks toward the counter", "LEFT"),
     "calm, slow, serious")),
 ("r5", 6, one(f"Close-up of {SAU} {FON}, {BCK}, in silence, he looks toward the counter and swallows, worried", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Chela en su mostrador, a cámara
 ("c36", 10, talk("c36", "Chela", f"Medium close-up of {CHE} {FON}, alone, standing behind the wooden counter, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she dries her hands on her apron, tilts her head, raises her eyebrows, nods and smiles. "
     f"Nobody else in the fonda.",
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
        ("¡", ""), ("!", "."), ("Y luego, lo de cada semana.", "Y luego, cada semana."), ("¿Le cerramos la fonda, jefe?", "¿Qué hacemos, jefe?"),
        ("Los muchachos ya están afuera.", "La gente ya está afuera."), ("Ve sacando el maletín.", "Ve trayendo el maletín."),
        ("su gente me apretó del hombro", "su gente me jaló de la camisa"), ("Y viniste a cobrarle a Chela.", "Y viniste a molestar a Chela.")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a small family fonda in a Mexican town in the morning, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{CHELA_VILLEGAS}", "an older Mexican cook"), ("@{TAVO_VILLEGAS2}", "a Mexican waiter"),
         ("@{SAUL_BETANCOURT2}", "a Mexican businessman"), ("@{ROLANDO_GUERO2}", "a Mexican bodyguard"),
         ("@{MACARIO_LEDESMA2}", "an old Mexican rancher"),
         (" @{LOC_FONDACHELA}", ""), (" @{LOC_CALLEFONDA}", "")]
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
