"""Genera los clips de fonda-chela-p2 PARTE 2 (El Jefe Nuevo · Parte 2, VISTA, mismos personajes y hojas que pieces/fonda-chela) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
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
# Parte 2 (castigo sin armas ni sangre): gancho 0-2 s = el jarro vacío junto al maletín cerrado (el final de la P1: "Ya se acabó el café").
# Justicia = órdenes y lealtades: Chela decide; Saúl devuelve los 200 mil casa por casa A PIE antes de que suenen las doce (campanario + reloj = cuenta atrás),
# sus tres camionetas y sus muchachos pasan a Macario (llaves sobre la mesa, el Güero cambia de lealtad) y se queda un año de mesero ("Yo no soy su mesero", P1 c10).
# Gancho a la Parte 3: Saúl mandaba la mitad cada domingo al que se lo recomendó a Macario, alguien que come en su mesa.
# Geografía fija (igual que la P1):
#   Mesa del fondo (c01, c02, c05-c09, c15, c20, c22, c23, c25-c27, c29-c33, r1, r2, r3, r4, r5): Saúl de pie a la IZQUIERDA; Macario sentado a la DERECHA;
#     el Güero en la puerta mira a la IZQUIERDA.
#   Mostrador: Chela detrás del mostrador mira a la DERECHA (hacia el fondo y hacia Tavo); Tavo junto al mostrador mira a la IZQUIERDA.
#   Calle (c10-c14, i04-i06): Tavo a la IZQUIERDA con una libretita, mira a la DERECHA; Saúl a la DERECHA junto a una puerta de madera, mira a la IZQUIERDA.
#   r6: Saúl ya con mandil de mesero, jarro en la mano, en medio de la fonda. CTA (c34): Chela sola en el mostrador, a cámara.
# Hojas de locación SIMPLES (lección intercambio): sin letreros, sin menús, sin marcas, sin adornos.
FON = ("inside the small humble fonda @{LOC_FONDACHELA} late in the morning: plain whitewashed walls, one simple wooden counter with one big brown clay pot on it, "
       "a few plain wooden tables and chairs, one open door to a sunny dusty street; warm golden light; no readable text, no menu boards, no signs, no logos, no calendar; "
       "no extras, nobody else in the fonda besides the person described")
CAL = ("on the dusty street @{LOC_CALLEFONDA} of a small Mexican town late in the morning: plain adobe houses painted in faded colors with old wooden doors; "
       "warm golden light, dust in the air; no readable text, no signs, no logos, no license plates")
# Anclas de identidad y ropa (las MISMAS de la P1). Solo Macario lleva sombrero y bigote; solo Saúl barba completa; solo el Güero es rubio. Nadie con lentes.
# Nota del usuario: los clips de Saúl a veces dan "políticas" con su hoja -> su descripción va MUY detallada (cara, pelo, barba, traje) para que el intento sin hoja (NOREF) se le parezca.
RING = "one heavy gold ring with a flat black stone on his right hand"
CHE = ("@{CHELA_VILLEGAS} (66-year-old Mexican woman, brown skin, round calm face with kind deep lines, grey hair in a low bun, small gold earrings, no hat, no glasses, "
       "lilac cotton blouse under a plain white apron, her hands kept low)")
TAV = ("@{TAVO_VILLEGAS2} (24-year-old Mexican man, clearly an adult, light brown skin, thin nervous face, short black hair, clean-shaven, no hat, no glasses, "
       "plain white short-sleeved button-up shirt with a collar and a chest pocket, fully buttoned, worn the whole time, a small black waiter's apron at the waist, his hands kept low)")
SAU = ("@{SAUL_BETANCOURT2} (40-year-old Mexican man, fair skin, narrow sharp face with high cheekbones, straight nose, dark brown eyes under thick straight black eyebrows, "
       "glossy black hair combed straight back with a few grey strands at the temples, short neatly trimmed full black beard joined to a black mustache, no hat, no glasses, "
       "dark charcoal grey two-piece suit with a faint check pattern (the jacket is dark, not light grey, not beige, not blue), black dress shirt open at the collar, no tie, "
       "one silver wristwatch on his left wrist, his hands kept low, he never points a finger at anyone)")
GUE = ("@{ROLANDO_GUERO2} (35-year-old Mexican man, light brown skin, wide round face with strong cheekbones, thick dark eyebrows with a small scar on one eyebrow, "
       "very short bleached BLOND buzz cut with dark roots, a thin dark goatee on the chin only, no hat, no glasses, worn black leather jacket over a plain black t-shirt, "
       "NOT a suit, his hands kept low)")
MAC = ("@{MACARIO_LEDESMA2} (74-year-old Mexican man, tan weathered skin, serene stern face, thick white mustache, grey felt cowboy hat, no glasses, "
       f"cream guayabera shirt, {RING}, his hands calm on the table)")
# Saúl de mesero (desde c27): el mismo traje y además un mandil negro de mesero atado a la cintura
SAUM = SAU.replace("one silver wristwatch", "a small black waiter's apron tied at the waist over the suit, one silver wristwatch")
NOBOARD = "plain whitewashed walls with no chalkboards, no menus, no frames, nothing written anywhere"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano. El maletín cerrado hasta i08 (vacío). Nada de billetes a la vista: sobres blancos cerrados.
MUG = "one brown clay mug of café de olla"
EMPTY = "one empty brown clay mug"
RADIO = "one black handheld radio held low in his RIGHT hand"
CASE = "one closed black leather briefcase"
NOTE = "one small spiral notebook held in his LEFT hand"
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

CNT = "standing behind the wooden counter on the LEFT"       # Chela
BCK = "standing on the LEFT beside the plain wooden table at the back of the fonda"  # Saúl en la mesa del fondo
SEAT = "seated alone on the RIGHT at the plain wooden table at the back of the fonda, a plate of chilaquiles in front of him"  # Macario
DOOR = "standing by the open door of the fonda"  # Güero
DOORS = "standing on the RIGHT beside an old wooden door of an adobe house"  # Saúl en la calle
STL = "standing on the LEFT in the middle of the dusty street"  # Tavo en la calle

CLIPS = [
 # 1. Gancho (0-2 s): el final de la P1 -- el jarro vacío junto al maletín cerrado, las camionetas afuera
 ("i01", 6, f"Extreme close-up insert {FON}: on a plain wooden table at the back, an old man's hand in a cream guayabera sleeve with {RING} sets down {EMPTY} "
            f"beside {CASE}; through the open door far behind, out of focus, several black SUVs with no logos. No faces. No dialogue."),
 ("c01", 8, talk("c01", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, {EMPTY} in front of him, he looks up slowly, calm and hard", "LEFT",
     NODOUBLE("old man in a grey felt hat")), "calm, slow, low, the one who is in charge")),
 ("r1", 6, one(f"Close-up of {SAU} {FON}, {BCK}, in silence, he swallows and looks toward the counter, worried", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")) + " Slow push-in. No dialogue."),
 ("c02", 6, talk("c02", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, he turns toward the counter, his hands open and low, pleading", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")), "pleading, quiet, worried")),
 ("c03", 6, talk("c03", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, calm and firm, her hands resting on the counter", "RIGHT",
     NODOUBLE("woman in a white apron")), "calm, firm, quiet")),
 ("c04", 6, talk("c04", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she raises her eyes toward the back of the fonda, serious", "RIGHT"),
     "firm, slow, dignified")),
 ("i02", 6, "Low angle shot: a small whitewashed village church bell tower with one old bronze bell hanging still, against a clear blue late-morning sky; "
            "no clock face, no text, no people. No dialogue."),
 ("c05", 6, talk("c05", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, surprised, he glances toward the door and back", "RIGHT"),
     "surprised, nervous")),
 ("c06", 8, talk("c06", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he taps the table once with two fingers, still calm", "LEFT",
     NODOUBLE("old man in a grey felt hat")), "calm, cold, low")),
 ("i03", 6, f"Close-up insert {FON}: a hand in a black leather jacket sleeve sets three black car keys on a plain wooden table beside {CASE}. "
            f"Only the hand, no faces. No dialogue."),
 ("c07", 6, talk("c07", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, {DOOR}, the sunny street behind him, {RADIO}, serious", "LEFT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "serious, low, steady")),
 ("r2", 6, one(f"Close-up of {SAU} {FON}, {BCK}, in silence, he turns his head toward the door, surprised and hurt, his mouth half open", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")) + " Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, hurt, his voice low", "RIGHT"),
     "hurt, bitter, quiet")),
 ("c09", 6, talk("c09", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, {DOOR}, he holds his gaze, calm", "LEFT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "calm, firm, low")),
 # 2. Casa por casa, a pie, antes de las doce (montaje en la calle)
 ("i04", 6, f"Aerial drone shot over the dusty street @{{LOC_CALLEFONDA}} of a small Mexican town late in the morning: one man in a dark charcoal grey suit walks slowly alone "
            f"down the middle of the street carrying {CASE}; two black SUVs with no logos roll slowly behind him at walking pace; a few distant townspeople watch from their doorways. No dialogue."),
 ("c10", 6, talk("c10", "Tavo", one(f"Close-up of {TAV} {CAL}, {STL}, {NOTE}, he reads from it, serious", "RIGHT",
     NODOUBLE("young man in a white shirt")), "serious, matter-of-fact")),
 ("i05", 6, f"Close-up insert {CAL}: at an old wooden door of an adobe house, an elderly woman's wrinkled hand in a flowered sleeve receives one plain white closed envelope "
            f"from a man's hand in a dark charcoal grey suit sleeve with a silver wristwatch. Only the hands, no faces. No dialogue."),
 ("c11", 6, talk("c11", "Saúl", one(f"Close-up of {SAU} {CAL}, {DOORS}, he lowers his head respectfully toward the door, ashamed", "LEFT",
     NODOUBLE("man in a charcoal grey suit")), "ashamed, quiet, respectful")),
 ("c12", 6, talk("c12", "Tavo", one(f"Close-up of {TAV} {CAL}, {STL}, {NOTE}, he looks up from it, calm", "RIGHT"),
     "calm, a little ironic")),
 ("i06", 6, "Extreme close-up insert: a silver wristwatch on a man's left wrist in a dark charcoal grey suit sleeve, the hands near eleven o'clock, "
            "a dusty sunny street behind out of focus; no readable text. No dialogue."),
 ("c13", 6, talk("c13", "Saúl", one(f"Close-up of {SAU} {CAL}, {DOORS}, the same man as in his reference image (narrow face, short black beard, black hair combed back, charcoal grey suit, black shirt), he looks toward the young man on the left, tired, both hands resting at his sides", "LEFT"),
     "tired, quiet, sincere")),  # QA v1: el intento 5 (sin hoja) salió con otra cara (barba larga, canas, saco a cuadros)
 ("c14", 6, talk("c14", "Tavo", one(f"Close-up of {TAV} {CAL}, {STL}, {NOTE}, he shakes his head slowly, firm", "RIGHT",
     NODOUBLE("young man in a white shirt")), "firm, calm, a little proud")),
 # 3. En la fonda: Chela dicta la sentencia (cama cálida c15-c20)
 ("c15", 6, talk("c15", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he turns his face toward the counter, serious", "LEFT"),
     "serious, calm, low")),
 ("c16", 6, talk("c16", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she shakes her head gently, a calm small smile", "RIGHT"),
     "calm, sure, a little playful")),
 ("r3", 6, one(f"Close-up of {MAC} {FON}, {SEAT}, in silence, a slow small smile under his white mustache", "LEFT",
     NODOUBLE("old man in a grey felt hat")) + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she dries a brown clay mug with a white cloth, serene", "RIGHT"),
     "serene, firm, a little ironic")),
 ("c18", 6, talk("c18", "Tavo", one(f"Close-up of {TAV} {FON}, standing on the RIGHT near the counter, confused, he speaks low", "LEFT",
     NODOUBLE("young man in a white shirt")), "confused, low")),
 ("c19", 6, talk("c19", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she looks at her nephew with tenderness, a warm small smile", "RIGHT"),
     "warm, tender, wise")),
 ("c20", 8, talk("c20", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, his eyes soft, he nods slowly toward the counter", "LEFT"),
     "warm, grateful, low")),
 # 4. Las doce: vuelve con el maletín vacío
 ("i07", 6, "Low angle shot: the old bronze bell in a small whitewashed village church bell tower starts to swing and ring, clear blue noon sky; "
            "no clock face, no text, no people. No dialogue."),
 ("c21", 6, talk("c21", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, {DOOR}, {RADIO}, he looks out to the street and back", "LEFT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "serious, low")),
 ("i08", 6, f"Close-up insert {FON}: hands in dark charcoal grey suit sleeves set one open black leather briefcase on a plain wooden table; it is completely empty inside. "
            f"Only the hands, no faces. No dialogue."),
 ("c22", 6, talk("c22", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, tired, his hair a little messy, his hands open and low", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")), "tired, sincere, quiet")),
 ("c23", 6, talk("c23", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, calm, a slight nod", "LEFT"),
     "calm, approving, low")),
 ("c24", 6, talk("c24", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she places one folded small black waiter's apron on the counter, calm", "RIGHT",
     NODOUBLE("woman in a white apron")), "calm, firm, a little ironic")),
 ("c25", 6, talk("c25", "Saúl", one(f"Close-up of {SAU} {FON}, {BCK}, surprised, he glances toward the door", "RIGHT"),
     "surprised, embarrassed, quiet")),
 ("c26", 6, talk("c26", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, still, his eyes fixed", "LEFT",
     NODOUBLE("old man in a grey felt hat")), "calm, hard, low")),
 ("r4", 6, one(f"Close-up of {SAU} {FON}, {BCK}, in silence, he lowers his head and nods slowly", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")) + " Slow push-in. No dialogue."),
 ("c27", 6, talk("c27", "Saúl", one(f"Close-up of {SAUM} {FON}, {BCK}, humble, his hands low", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")), "humble, quiet")),
 ("c28", 6, talk("c28", "Chela", one(f"Close-up of {CHE} {FON}, {CNT}, she pours coffee from the big clay pot into {MUG} on the counter, a small knowing smile", "RIGHT"),
     "calm, playful, firm")),
 # 5. Gancho a la Parte 3: la mitad iba a otro (suspenso)
 ("c29", 6, talk("c29", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, standing near the back table, he leans in a little and speaks low", "RIGHT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "low, careful, a whisper")),
 ("c30", 6, talk("c30", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he turns his head toward him slowly, serious", "LEFT"),
     "serious, low, slow")),
 ("c31", 6, talk("c31", "the blond bodyguard", one(f"Close-up of {GUE} {FON}, standing near the back table, serious, he holds his gaze", "RIGHT",
     NODOUBLE("man in a black leather jacket") + ", no man in a grey suit"), "low, serious")),
 ("r5", 6, one(f"Close-up of {MAC} {FON}, {SEAT}, in silence, his serene face hardens, he slowly sets down {MUG} on the table", "LEFT",
     NODOUBLE("old man in a grey felt hat")) + " Slow push-in. No dialogue."),
 ("c32", 6, talk("c32", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he looks down at the table, cold and quiet", "LEFT"),
     "cold, quiet, slow")),
 ("r6", 6, one(f"Close-up of {SAUM} {FON}, standing in the middle of the fonda, {MUG} in his RIGHT hand, in silence, he freezes and looks toward the back table, worried", "RIGHT",
     NODOUBLE("man in a charcoal grey suit")) + " Slow push-in. No dialogue."),
 ("c33", 6, talk("c33", "Macario", one(f"Close-up of {MAC} {FON}, {SEAT}, he turns toward the counter, calm again, his eyes hard", "LEFT"),
     "calm, low, the one who is in charge")),
 # CTA con carisma (después del BLACK): Chela en su mostrador, a cámara
 ("c34", 10, talk("c34", "Chela", f"Medium close-up of {CHE} {FON}, alone, standing behind the wooden counter, looking straight into the camera and talking to the viewer from the very first second, "
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
        ("¡", ""), ("!", "."), ("Ya se acabó el café, muchacho.", "Ya se terminó el café, muchacho."),
        ("Los muchachos ya no trabajan pa' usted.", "La gente ya no está con usted."), ("Desde hoy obedecen a don Macario.", "Desde hoy están con don Macario."),
        ("Usted le cobró a doña Chela, jefe.", "Usted molestó a doña Chela, jefe."), ("A ella le cobró tres mil.", "A ella le debe tres mil."),
        ("Usted cobró con tres camionetas.", "Usted llegó en tres camionetas."), ("Delante de todos, como cobraste.", "Delante de todos, como llegaste."),
        ("se lo juro", "de verdad"), ("Ayúdame con la mitad, ándale.", "Échame la mano con la mitad, ándale."),  # c13: con hoja da políticas 4 veces (2026-11-08)
 ("O te vas sin nada, tú escoges.", "O te vas a pie, tú escoges.")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a small family fonda in a Mexican town late in the morning, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
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
    print("FIN P2", flush=True)

if __name__ == "__main__":
    main()
