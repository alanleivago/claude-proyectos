"""Genera los clips de viuda-aguacate-p2 PARTE 2 (La Viuda del Aguacate, castigo de los abusadores, MEXI como la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Fórmula capos (resumen atrium-vista): gancho visual en 0-2 s (el bastón se aprieta) con plazo (antes de que se meta el sol, de la Parte 1);
# poder SIN armas: convoy de ocho camionetas, escoltas de manos cruzadas, radio, bastón, maletín cerrado. Insertos i* sin caras y reacciones mudas r* para el ritmo de <=2 s por plano.
# Parte 2: castigo del notario (escrituras rotas, sello), de Wences (radio, a pie) y del hijo Arnulfo (llaves, huertas, cortador una temporada).
# Geografía fija (solo define hacia dónde mira cada uno). Todo en el portón de la huerta, del atardecer dorado (c01) a la puesta de sol (i08, c33):
#   Engracia a la IZQUIERDA junto al portón; Fito a la IZQUIERDA cerca de ella; Ponciano a la DERECHA en el camino; Wences a la DERECHA junto al portón;
#   Arnulfo (desde c04) a la DERECHA delante de su camioneta blanca; Nicandro al CENTRO: mira a la DERECHA (Ponciano/Wences/Arnulfo) o a la IZQUIERDA (Engracia/Fito).
#   CTA (c34): Engracia sola junto al portón, a cámara.
# Parte 2 = castigo SIN armas ni sangre: escrituras rotas, sello de notario entregado, maletín a los cortadores, radio entregado, irse a pie, llaves de la camioneta y de las huertas, Arnulfo de cortador.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin marcas, sin adornos, sin imágenes religiosas.
HUE0 = ("at the entrance of the avocado orchard @{LOC_HUERTAGUACATE} in the green hills of Michoacán in the late golden afternoon, the sun low over the hills: a plain wooden gate with an open chain, "
        "a dirt path, rows of dark green avocado trees, a small plain adobe house at one side; warm low golden light; no readable text, no signs, no logos, no license plates")
HUE = HUE0 + "; no extras, nobody else in the orchard besides the person described"
SUNSET = HUE.replace("in the late golden afternoon, the sun low over the hills", "at sunset, the sun just gone behind the hills").replace("warm low golden light", "soft orange and blue dusk light")
# Anclas de identidad y ropa (las de la Parte 1 + Arnulfo). Solo Ponciano lleva lentes; solo Fito gorra; solo Nicandro sombrero y bastón; solo Wences cola de caballo y piocha;
# solo Engracia rebozo; solo Arnulfo saco azul marino y reloj de oro. Manos abiertas, nadie señala con el dedo. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
ENG = ("@{ENGRACIA_MURGUIA} (64-year-old Mexican woman, brown skin, long thin face with deep lines, short wavy grey hair, small silver earrings, no hat, no glasses, "
       "plain black long-sleeved blouse with a dark grey rebozo over her shoulders, her hands kept low)")
FIT = ("@{FITO_CUEVAS} (25-year-old Mexican man, clearly an adult, brown skin, round face, curly short black hair, clean-shaven, a plain beige cap with no logo, no glasses, "
       "faded olive-green work shirt with rolled sleeves, his hands kept low)")
PON = ("@{PONCIANO_UGALDE} (52-year-old Mexican man, light skin, soft round face, bald head, thin grey mustache, round gold-rimmed glasses, no hat, "
       "beige linen suit with a white shirt and a brown tie, his hands kept low, he never points a finger at anyone)")
WEN = ("@{WENCES_PICHARDO} (38-year-old Mexican man, tan skin, broad heavy face, long black hair tied in a low ponytail, thick black goatee, no hat, no glasses, "
       "burgundy western shirt under a black vest, his hands kept low)")
CANE = "his right hand resting on a carved wooden cane with a silver handle"
NIC = ("@{NICANDRO_SOLORZANO} (78-year-old Mexican man, tan weathered skin, long serene face with deep wrinkles, long grey sideburns, clean-shaven, "
       f"a tan palm-straw cowboy hat with a black band, no glasses, dark brown suede jacket over a white shirt, a silver bolo tie, {CANE})")
ARN = ("@{ARNULFO_SOLORZANO} (40-year-old Mexican man, light brown skin, oval face with a square jaw, short black hair neatly combed to the side, clean-shaven, a small mole on his left cheek, "
       "no hat, no glasses, navy blue blazer over a light blue open-collar shirt, one gold wristwatch on his LEFT wrist, his hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano. El maletín siempre CERRADO (nada de billetes a la vista).
FOLDER = "one closed cream paper folder"
CASE = "one closed brown leather briefcase"
SMART = "one black smartphone held to his RIGHT ear"
RADIO = "one black handheld radio held low in his RIGHT hand"
KEYS = "one small ring of keys"
TRUCK = "one plain white pickup truck with no logos parked behind him"
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

EL = "standing on the LEFT beside the wooden gate of the orchard"          # Engracia
FL = "standing on the LEFT near the wooden gate"                            # Fito
PR = "standing on the RIGHT on the dirt path in front of the gate"          # Ponciano
WR = "standing on the RIGHT beside the open wooden gate"                    # Wences
AR = f"standing on the RIGHT on the dirt path, {TRUCK}"                     # Arnulfo
NC = "standing in the CENTER of the dirt path in front of the gate, black SUVs far behind him"  # Nicandro

CLIPS = [
 # 1. Gancho (0-2 s): el bastón se aprieta, Nicandro manda llamar a su hijo antes de que se meta el sol
 ("i01", 6, f"Extreme close-up insert {HUE0}: an old man's wrinkled right hand tightens hard on the silver handle of a carved wooden cane, the low sun shining on the silver. "
            f"Only the hand and the cane, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, very serious, his eyes hard", "RIGHT",
     NODOUBLE("old man in a palm-straw hat")), "cold, slow, low, the one who is in charge")),
 ("c02", 6, talk("c02", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, {SMART}, nervous, his eyes on the ground", "LEFT",
     NODOUBLE("man in a beige linen suit")), "nervous, quiet, quick")),
 ("r1", 6, one(f"Close-up of {ENG} {HUE}, {EL}, in silence, calm, she lifts her eyes toward the low sun over the hills", "RIGHT") + " Slow push-in. No dialogue."),
 ("i02", 6, f"Aerial drone shot over a dirt road between green avocado orchards in the hills of Michoacán in the late golden afternoon: one plain white pickup truck with no logos "
            f"drives alone raising dust. No other cars, no people visible, no license plates. No dialogue."),
 ("c03", 6, talk("c03", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, {RADIO}, he looks out to the road and back, worried", "LEFT",
     NODOUBLE("man with a black ponytail")), "worried, low")),
 ("i03", 6, f"Close-up insert {HUE0}: one plain white pickup truck with no logos stops on the dirt path; its door opens and brown leather loafers step down onto the dust. "
            f"Only the truck door and the shoes, no faces, no license plates. No dialogue."),
 # 2. El hijo frente al padre
 ("c04", 6, talk("c04", "Arnulfo", one(f"Close-up of {ARN} {HUE}, {AR}, surprised and annoyed, he looks straight ahead", "LEFT",
     NODOUBLE("man in a navy blue blazer")),
     "surprised, annoyed, a little cocky")),
 ("c05", 6, talk("c05", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, calm and hurt, he looks straight at him", "RIGHT"),
     "calm, hurt, low")),
 ("c06", 6, talk("c06", "Arnulfo", one(f"Close-up of {ARN} {HUE}, {AR}, he shrugs, cold", "LEFT",
     NODOUBLE("man in a navy blue blazer")), "cold, dismissive")),
 ("c07", 6, talk("c07", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, still, his hand firm on the cane", "RIGHT"),
     "firm, final, low")),
 ("c08", 6, talk("c08", "Arnulfo", one(f"Close-up of {ARN} {HUE}, {AR}, defensive, his hands open", "LEFT"),
     "defensive, quick")),
 ("c09", 8, talk("c09", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he holds {FOLDER} against his chest, afraid, he speaks low", "LEFT"),
     "afraid, quiet, quick")),
 ("r2", 6, one(f"Close-up of {ARN} {HUE}, {AR}, in silence, he glances sideways and swallows, caught", "LEFT") + " Slow push-in. No dialogue."),
 # 3. Momento cálido: Lauro era su padrino
 ("c10", 6, talk("c10", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, calm, her eyes shine", "RIGHT",
     NODOUBLE("woman in a grey rebozo")), "tender, firm, quiet")),
 ("c11", 6, talk("c11", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, she glances at the avocado trees and back, a sad small smile", "RIGHT"),
     "tender, sad, quiet")),
 ("r3", 6, one(f"Close-up of {ARN} {HUE}, {AR}, in silence, he lowers his eyes, ashamed", "LEFT") + " Slow push-in. No dialogue."),
 ("c12", 6, talk("c12", "Arnulfo", one(f"Close-up of {ARN} {HUE}, {AR}, wearing his NAVY BLUE BLAZER buttoned open over the light blue shirt the whole time (never in shirt sleeves, the dark blazer clearly visible on both shoulders), ashamed, his voice low", "LEFT", NODOUBLE("man in a navy blue blazer")),
     "ashamed, sincere, quiet")),
 # 4. Castigo del notario: escrituras rotas, sello de notario, el maletín a los cortadores
 ("c13", 6, talk("c13", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he lifts his chin toward him", "RIGHT"),
     "calm, firm, low")),
 ("i04", 6, f"Close-up insert {HUE0}: hands in beige linen suit sleeves take a paper document out of {FOLDER} and tear it in two, then again; the torn pieces fall onto the dirt. "
            f"Only the hands and the paper, no faces, no readable text. No dialogue."),
 ("c14", 6, talk("c14", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, sweating, his hands empty and low", "LEFT"),
     "ashamed, quiet")),
 ("c15", 6, talk("c15", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, still, cold", "RIGHT",
     NODOUBLE("old man in a palm-straw hat")), "cold, slow, low")),
 ("c16", 6, talk("c16", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he takes off his round glasses, pleading", "LEFT"),
     "pleading, worried")),
 ("c17", 6, talk("c17", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, a cold small smile", "RIGHT"),
     "dry, cold, slow")),
 ("c18", 6, talk("c18", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he nods once toward the left", "RIGHT"),
     "calm, firm")),
 ("i05", 6, f"Close-up insert {HUE0}: hands in beige linen suit sleeves place {CASE} into the open hands of a young man in faded olive-green sleeves; the briefcase stays closed. "
            f"Only the hands and the briefcase, no faces. No dialogue."),
 ("c19", 6, talk("c19", "Fito", one(f"Close-up of {FIT} {HUE}, {FL}, he holds {CASE} against his chest, the briefcase stays closed, moved, a small smile", "RIGHT",
     NODOUBLE("young man in an olive-green shirt")), "moved, happy, quick")),
 # 5. Castigo de Wences: entrega el radio y se va a pie con el licenciado
 ("c20", 6, talk("c20", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, {RADIO}, worried, his eyes down", "LEFT"),
     "worried, pleading, quick")),
 ("c21", 6, talk("c21", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, hard, he looks straight at him", "RIGHT"),
     "hard, low")),
 ("r4", 6, one(f"Close-up of {WEN} {HUE}, {WR}, in silence, he lowers {RADIO.replace('held low in his RIGHT hand', 'in his RIGHT hand')} and lets it hang, ashamed, eyes down", "LEFT") + " Slow push-in. No dialogue."),
 ("c22", 6, talk("c22", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, calm and final", "RIGHT"),
     "calm, final, low")),
 ("c23", 6, talk("c23", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, surprised, his hands empty and open", "LEFT"),
     "surprised, worried")),
 ("c24", 6, talk("c24", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he glances toward the left and back, serious", "RIGHT"),
     "serious, slow, low")),
 ("i06", 6, f"Wide shot from behind {HUE0}: two men walk away on foot down the long dirt road toward the low sun, one bald man in a beige linen suit and one man with a black ponytail "
            f"in a burgundy shirt and black vest; their hands are empty; black SUVs parked at the side of the road. Only their backs, no faces. No dialogue."),
 # 6. Castigo de Arnulfo: llaves, huertas y una temporada de cortador
 ("c25", 6, talk("c25", "Arnulfo", one(f"Close-up of {ARN} {HUE}, {AR}, worried, his jaw tight", "LEFT",
     NODOUBLE("man in a navy blue blazer")), "worried, tense, quick")),
 ("c26", 6, talk("c26", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, his free left hand open and held out, palm up", "RIGHT"),
     "calm, cold, slow")),
 ("i07", 6, f"Close-up insert {HUE0}: a man's hand with a gold wristwatch and a navy blue blazer sleeve places {KEYS} into the open palm of an old woman's hand in a black sleeve. "
            f"Only the two hands and the keys, no faces. No dialogue."),
 ("c27", 6, talk("c27", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, firm, his hand tight on the cane", "RIGHT"),
     "firm, final, low")),
 ("c28", 6, talk("c28", "Arnulfo", one(f"Close-up of {ARN} {HUE}, {AR}, shocked, he looks toward the rows of avocado trees and back", "LEFT"),
     "shocked, disbelieving")),
 ("c29", 8, talk("c29", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, a hint of a sad smile, he nods slowly", "RIGHT"),
     "calm, sad, low")),
 ("c30", 6, talk("c30", "Fito", one(f"Close-up of {FIT} {HUE}, {FL}, a small proud grin, he tips his beige cap", "RIGHT"),
     "amused, proud, friendly")),
 ("r5", 6, one(f"Medium close-up of {ARN} {HUE}, {AR}, in silence, he takes off his navy blue blazer and folds it over his arm, eyes down", "LEFT") + " Slow push-in. No dialogue."),
 # 7. Cierre: la palabra pesa más que el apellido, se mete el sol
 ("c31", 6, talk("c31", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, {KEYS} in her LEFT hand, moved, soft", "RIGHT"),
     "moved, soft, quiet")),
 ("c32", 8, talk("c32", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he touches the brim of his hat, warm and serious", "LEFT"),
     "warm, serious, low")),
 ("i08", 6, f"Wide shot {SUNSET.replace(' besides the person described', '')}: the last edge of the sun disappears behind the green hills over the rows of avocado trees; "
            f"the wooden gate open in front. No people visible. No dialogue."),
 ("c33", 8, talk("c33", "Nicandro", one(f"Close-up of {NIC} {SUNSET}, {NC}, he looks at the sky and back, a warm small smile", "LEFT"),
     "warm, calm, slow")),
 # CTA con carisma (después del BLACK): Engracia junto al portón, a cámara
 ("c34", 10, talk("c34", "Engracia", f"Medium close-up of {ENG} {SUNSET}, alone, standing beside the open wooden gate of the orchard, {KEYS} in her LEFT hand, looking straight into the camera "
     f"and talking to the viewer from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she adjusts her grey rebozo on her shoulders, "
     f"tilts her head, raises her eyebrows, nods and smiles a little. Nobody else in the orchard.",
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
        ("¡", ""), ("!", "."), ("Rómpalas aquí, delante de todos.", "Deshágalas aquí, delante de todos."), ("tear it in two, then again", "fold it and rip it in half"), ("Mañana entrega su sello de notario.", "Mañana deja su sello de notario."), ("Deja ese radio, ya no trabajas.", "Suelta ese radio, ya no trabajas aquí."), ("tightens hard on", "rests firmly on"), ("caught", "quiet")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, an avocado orchard in the hills of Michoacán in the golden afternoon, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{ENGRACIA_MURGUIA}", "an older Mexican widow"), ("@{FITO_CUEVAS}", "a young Mexican farm worker"),
         ("@{PONCIANO_UGALDE}", "a Mexican notary"), ("@{WENCES_PICHARDO}", "a Mexican foreman"),
         ("@{NICANDRO_SOLORZANO}", "an old Mexican rancher"), ("@{ARNULFO_SOLORZANO}", "a Mexican businessman"),
         (" @{LOC_HUERTAGUACATE}", "")]
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
