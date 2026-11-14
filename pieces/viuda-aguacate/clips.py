"""Genera los clips de viuda-aguacate PARTE 1 (La Viuda del Aguacate, historia propia tipo CAPOS, premisa 2 de fuentes/atrium-vista/resumen.md, MEXI) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Fórmula capos (resumen atrium-vista): gancho visual en 0-2 s (candado en el portón de la huerta + aguacates tirados) con cifra y plazo (72 horas, cien mil contra ocho millones);
# poder SIN armas: convoy de ocho camionetas, escoltas de manos cruzadas, radio, bastón, maletín cerrado. Insertos i* sin caras y reacciones mudas r* para el ritmo de <=2 s por plano.
# Protagonista matriarca (viuda), el protector poderoso "no vino solo"; castigo del notario y del hijo para la Parte 2.
# Geografía fija (solo define hacia dónde mira cada uno):
#   Portón de la huerta (c01-c12, c17-c36, r1-r3, r5): Engracia a la IZQUIERDA junto al portón; Fito a la IZQUIERDA cerca de ella; Ponciano a la DERECHA en el camino;
#     Wences a la DERECHA junto al portón con candado. Nicandro (desde c22) al CENTRO: mira a la DERECHA (Ponciano/Wences) o a la IZQUIERDA (Engracia).
#   Cocina de Engracia (c13-c15, i03, i04): Engracia a la IZQUIERDA junto al ropero, mira a la DERECHA; Fito a la DERECHA en la puerta, mira a la IZQUIERDA.
#   c16: Nicandro solo en el asiento de atrás de su camioneta (sin hoja de locación). CTA (c36): Engracia sola junto al portón, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin marcas, sin adornos, sin imágenes religiosas.
HUE0 = ("at the entrance of the avocado orchard @{LOC_HUERTAGUACATE} in the green hills of Michoacán in the golden afternoon: a plain wooden gate with a chain, "
        "a dirt path, rows of dark green avocado trees, a small plain adobe house at one side; warm golden light; no readable text, no signs, no logos, no license plates")
HUE = HUE0 + "; no extras, nobody else in the orchard besides the person described"
CAS = ("inside the humble kitchen @{LOC_COCINAENGRACIA} of an adobe house in the afternoon: plain whitewashed walls, one old dark wooden wardrobe, a simple wooden table, "
       "one small window with warm light; no readable text, no calendar, no religious images, no decorations; nobody else in the kitchen besides the person described")
SUV = ("inside the back seat of a black SUV with tinted windows, green avocado orchards passing outside in the golden afternoon; no logos, no readable text; "
       "nobody else visible in the car")
# Anclas de identidad y ropa. Solo Ponciano lleva lentes; solo Fito gorra; solo Nicandro sombrero y bastón; solo Wences cola de caballo y piocha; solo Engracia rebozo.
# Manos abiertas, nadie señala con el dedo. Sin uniformes, gafetes ni letras en la ropa. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
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
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11). El maletín siempre CERRADO (nada de fajos a la vista).
FOLDER = "one closed cream paper folder"
CASE = "one closed brown leather briefcase"
CRATE = "one wooden crate"
PHONE = "one old small black flip phone"
PHONEH = "one old small black flip phone held in her LEFT hand"
RADIO = "one black handheld radio held low in his RIGHT hand"
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
WR = "standing on the RIGHT beside the padlocked wooden gate"               # Wences
NC = "standing in the CENTER of the dirt path in front of the gate, black SUVs far behind him"  # Nicandro
KW = "standing on the LEFT beside the old wooden wardrobe"                  # Engracia en la cocina
KD = "standing on the RIGHT by the kitchen door"                            # Fito en la cocina

CLIPS = [
 # 1. Gancho (0-2 s): candado en el portón, el notario pone plazo, aguacates al piso
 ("i01", 6, f"Close-up insert {HUE0}: a hand in a burgundy shirt sleeve snaps one heavy steel padlock shut on a chain wrapped around the wooden gate of the orchard. "
            f"Only the hand, the chain and the gate, no faces. No dialogue."),
 ("c01", 8, talk("c01", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he holds {FOLDER} against his chest, a cold polite smile", "LEFT",
     NODOUBLE("man in a beige linen suit")), "cold, polite, unhurried")),
 ("i02", 6, f"Close-up insert {HUE0}: a black boot tips over {CRATE} on the dirt; dozens of green avocados roll on the ground at the foot of the wooden gate. "
            f"Only the boot, the crate and the avocados, no faces. No dialogue."),
 ("c02", 6, talk("c02", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, firm and dignified, her chin up", "RIGHT",
     NODOUBLE("woman in a grey rebozo")), "firm, dignified, quiet")),
 ("c03", 8, talk("c03", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he taps {FOLDER} once with two fingers, smug", "LEFT"),
     "smug, calm, cold")),
 ("r1", 6, one(f"Close-up of {FIT} {HUE}, {FL}, in silence, he picks up one avocado from the ground and holds it, his jaw tight", "RIGHT") + " Slow push-in. No dialogue."),
 ("c04", 8, talk("c04", "Fito", one(f"Close-up of {FIT} {HUE}, {FL}, worried, one avocado in his hand", "RIGHT",
     NODOUBLE("young man in an olive-green shirt")), "worried, upset, quick")),
 ("c05", 6, talk("c05", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, {RADIO}, a mocking half smile", "LEFT",
     NODOUBLE("man with a black ponytail")), "mocking, cold")),
 # 2. La oferta: un comprador sin nombre, cien mil contra ocho millones
 ("c06", 6, talk("c06", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, she looks straight ahead, calm", "RIGHT"),
     "calm, firm, hard")),
 ("c07", 6, talk("c07", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he adjusts his round glasses, evasive", "LEFT"),
     "evasive, cold")),
 ("c08", 6, talk("c08", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he lifts {CASE} a little, the briefcase stays closed, a cold smile", "LEFT"),
     "cold, confident, low")),
 ("c09", 8, talk("c09", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, indignant, she shakes her head slowly", "RIGHT"),
     "indignant, firm")),
 ("c10", 6, talk("c10", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, {RADIO}, he shrugs", "LEFT"),
     "dismissive, cold")),
 ("r2", 6, one(f"Close-up of {ENG} {HUE}, {EL}, in silence, she turns her eyes toward the small adobe house, thinking, her jaw firm", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", 6, talk("c11", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, calm and decided, she glances toward her house", "RIGHT"),
     "calm, decided")),
 ("c12", 6, talk("c12", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he laughs once, mocking", "LEFT"),
     "mocking, amused")),
 # 3. El ropero: el celular del difunto, un solo número
 ("i03", 6, f"Close-up insert {CAS}: an old woman's hands in black sleeves open a drawer of the old wooden wardrobe and unwrap {PHONE} from a white cloth. "
            f"Only the hands, no faces. No dialogue."),
 ("c13", 6, talk("c13", "Fito", one(f"Close-up of {FIT} {CAS}, {KD}, surprised, he speaks low", "LEFT",
     NODOUBLE("young man in an olive-green shirt")), "surprised, a whisper")),
 ("c14", 6, talk("c14", "Engracia", one(f"Close-up of {ENG} {CAS}, {KW}, {PHONEH}, she looks at it with tender eyes", "RIGHT"),
     "tender, firm, quiet")),
 ("i04", 6, f"Extreme close-up insert {CAS}: an old woman's thumb presses a key of {PHONE}; its small screen lights up with a soft glow, no readable text on the screen. "
            f"Only the hand and the phone. No dialogue."),
 ("c15", 8, talk("c15", "Engracia", one(f"Close-up of {ENG} {CAS}, {KW}, she holds {PHONE} to her LEFT ear, her eyes lowered, very serious", "RIGHT"),
     "serious, low, steady")),
 # 4. Montaje paralelo: Nicandro recibe la llamada y sale el convoy
 ("c16", 8, talk("c16", "Nicandro", one(f"Close-up of {NIC} {SUV}, he lowers a small black phone from his ear, serious", "LEFT",
     NODOUBLE("old man in a palm-straw hat")), "serious, low, slow, the one who is in charge")),
 ("i05", 6, f"Aerial drone shot over a dirt road between green avocado orchards in the hills of Michoacán in the golden afternoon: eight black SUVs with no logos "
            f"drive in a line raising dust. No people visible, no license plates. No dialogue."),
 ("c17", 6, talk("c17", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, amused, he raises his eyebrows", "LEFT"),
     "amused, mocking")),
 ("c18", 6, talk("c18", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, {PHONEH}, serene", "RIGHT"),
     "serene, calm, sure")),
 ("c19", 6, talk("c19", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, {RADIO}, worried, he looks out to the road and back", "LEFT"),
     "worried, quick, low")),
 ("c20", 6, talk("c20", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he forces a smile, a little uneasy", "LEFT"),
     "proud, a little nervous")),
 # 5. La llegada: ocho camionetas; Nicandro conoce al notario
 ("i06", 6, f"Wide shot {HUE0}: eight black SUVs with no logos stop in a cloud of dust in front of the padlocked wooden gate; men in plain black suits step out "
            f"and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("c21", 6, talk("c21", "Wences", one(f"Close-up of {WEN} {HUE}, {WR}, {RADIO}, worried, he lowers the radio", "LEFT"),
     "worried, a whisper")),
 ("i07", 6, f"Close-up insert {HUE0}: an old man's hand on a carved wooden cane with a silver handle; the tip of the cane touches the dusty ground beside the open door "
            f"of a black SUV and brown boots step down. Only the hand, the cane and the boots, no faces. No dialogue."),
 ("c22", 6, talk("c22", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he touches the brim of his hat, warm and serious", "LEFT",
     NODOUBLE("old man in a palm-straw hat")), "warm, serious, low")),
 ("c23", 6, talk("c23", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, nervous but proud", "LEFT"),
     "nervous, proud")),
 ("c24", 8, talk("c24", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, calm, he looks straight at him", "RIGHT"),
     "calm, cold, slow")),
 ("r3", 6, one(f"Close-up of {PON} {HUE}, {PR}, in silence, his polite smile fades, he takes off his round glasses and swallows", "LEFT") + " Slow push-in. No dialogue."),
 ("c25", 8, talk("c25", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, worried, his hands open and low", "LEFT"),
     "worried, quick, pleading")),
 ("c26", 6, talk("c26", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, very calm", "RIGHT"),
     "calm, hard, low")),
 # 6. Momento cálido: diez años sin visita, la promesa a Lauro
 ("c27", 6, talk("c27", "Engracia", one(f"Close-up of {ENG} {HUE}, {EL}, her eyes shine, a soft reproach", "RIGHT"),
     "hurt, tender, quiet")),
 ("c28", 8, talk("c28", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, his eyes soft, he speaks gently", "LEFT"),
     "gentle, sincere, low")),
 ("c29", 8, talk("c29", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he nods slowly, a warm small smile", "LEFT"),
     "warm, grateful, low")),
 ("r4", 6, one(f"Close-up of {ENG} {HUE}, {EL}, in silence, her eyes shine, she holds {PHONE} against her chest with both hands", "RIGHT") + " Slow push-in. No dialogue."),
 # 7. Inversión, plazo y el nombre del comprador (el castigo queda para la Parte 2)
 ("c30", 6, talk("c30", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, calm, he lifts his chin toward the gate", "RIGHT"),
     "calm, firm, low")),
 ("r5", 6, f"Medium shot of {WEN} {HUE}, {WR}, in silence, he kneels on the dirt and puts green avocados back one by one into {CRATE}, ashamed, eyes down; "
           f"{SOLO}; {ALONE}. Slow push-in. No dialogue."),
 ("c31", 8, talk("c31", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, he looks at the sky and back, calm and final", "RIGHT"),
     "calm, final, slow")),
 ("c32", 6, talk("c32", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, sweating, he holds {CASE} against his chest, the briefcase stays closed", "LEFT"),
     "ashamed, worried, quiet")),
 ("c33", 6, talk("c33", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, still, his eyes fixed", "RIGHT"),
     "calm, hard, quiet")),
 ("c34", 8, talk("c34", "Ponciano", one(f"Close-up of {PON} {HUE}, {PR}, he lowers his voice, afraid", "LEFT"),
     "afraid, a whisper")),
 ("c35", 8, talk("c35", "Nicandro", one(f"Close-up of {NIC} {HUE}, {NC}, his hand tightens on the cane, he closes his eyes for a second and opens them, hurt and serious", "LEFT"),
     "hurt, serious, low")),
 # CTA con carisma (después del BLACK): Engracia junto al portón, a cámara
 ("c36", 10, talk("c36", "Engracia", f"Medium close-up of {ENG} {HUE}, alone, standing beside the wooden gate of the orchard, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she adjusts her grey rebozo on her shoulders, tilts her head, "
     f"raises her eyebrows, nods and smiles a little. Nobody else in the orchard.",
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
        ("¡", ""), ("!", "."), ("Le doy cien mil por irse.", "Le ofrezco cien mil, señora."), ("Junta a toda la gente.", "Avísale a toda la gente."),
        ("Para romper esas escrituras.", "Para deshacer esas escrituras."), ("Pero de aquí te vas hoy.", "Pero hoy te vas de aquí."),
        ("snaps one heavy steel padlock shut", "closes one heavy steel padlock"), ("tips over", "knocks over")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, an avocado orchard in the hills of Michoacán in the golden afternoon, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{ENGRACIA_MURGUIA}", "an older Mexican widow"), ("@{FITO_CUEVAS}", "a young Mexican farm worker"),
         ("@{PONCIANO_UGALDE}", "a Mexican notary"), ("@{WENCES_PICHARDO}", "a Mexican foreman"),
         ("@{NICANDRO_SOLORZANO}", "an old Mexican rancher"),
         (" @{LOC_HUERTAGUACATE}", ""), (" @{LOC_COCINAENGRACIA}", "")]
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
