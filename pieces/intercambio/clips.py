"""Genera los clips de intercambio PARTE 1 (La Virgen de los Villaseñor, video 22, historia ORIGINAL navideña, MEXI) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2 / nochebuena c18: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c29 / chocolate-rancho-p2 c34 / medalla-mezcal-p2 c01 / posada c22 / regreso-20 c28: frase repetida al final -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA camionero v1 / posada / fierro-herradura: "looking at X off-screen" pone a X (o a un doble) en el borde -> TODOS los planos son de una sola persona
# (ONE + ALONE) con la mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder (QA padre-veladoras-p2, canasta c12).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Sala (c01-c08, r1, c14-c26, i1, r2, r3): Aurora sentada al CENTRO en su sillón junto al nacimiento; Constanza y Germán de pie a la DERECHA junto al árbol;
#     Fabiola y Emilio a la IZQUIERDA junto a la puerta del patio.
#   Patio (c09-c13): Fabiola IZQUIERDA y Emilio DERECHA, farolitos encendidos.
#   Payoff en la sala (c27-c28): Fabiola junto al nacimiento a la IZQUIERDA; Emilio a la DERECHA.
#   Patio de noche, casi a oscuras (c29-c31): Constanza IZQUIERDA y Germán DERECHA.
#   r4 y CTA (c32): Fabiola sola junto al nacimiento.
SAL = ("in the spacious living room @{LOC_SALANAVIDAD2} of a wealthy old Mexican house on Christmas Eve night, pale cantera stone arches, "
       "a tall Christmas tree with warm white lights and red and gold ornaments, red poinsettia plants, a carved dark wooden side table, warm lamp light; "
       "no readable text, no signs, no cards with writing; no extras, nobody else in the room besides the person described")
PAT = ("in the inner courtyard @{LOC_PATIOVILLASENOR} of the same old Mexican house on Christmas Eve night, terracotta tiled floor, ochre walls with stone arches, "
       "a small stone fountain, paper bag lanterns with candles glowing along a low wall, potted red poinsettias; no readable text; no extras, nobody else in the courtyard")
PATN = PAT.replace("paper bag lanterns with candles glowing along a low wall", "most paper lanterns already out, only two candles still glowing, deep shadows")
# Anclas de identidad y ropa (vestuario fijo). NADIE lleva sombrero ni lentes (QA reten/medalla P2: sombreros dobles; reten-sierra-p2 c21: lentes que entran y salen).
# Ningún gorro navideño (es un sombrero). Manos abiertas, nadie señala con el dedo. Sin niños: el nacimiento solo lleva a San José, el buey y el burro (y luego la Virgen).
FAB = ("@{FABIOLA_OCHOA} (34-year-old Mexican mestizo woman, brown skin, warm honest face, long black hair in one single low braid over her shoulder, no hat, no glasses, "
       "simple wine-red knit sweater, long dark grey skirt, small gold hoop earrings, her hands open)")
CON = ("@{CONSTANZA_VILLASENOR} (46-year-old Mexican woman, light brown skin, elegant proud face, sleek straight dark brown hair cut at the shoulders, no hat, no glasses, "
       "long-sleeve emerald green velvet dress, one thin gold necklace, small gold drop earrings, her hands open and kept low, she never points a finger at anyone)")
GER = ("@{GERMAN_ALTAMIRANO} (50-year-old Mexican man, light brown skin, grey hair combed back, short neat grey beard, no hat, no glasses, "
       "charcoal grey suit jacket over a black turtleneck sweater, his hands open and kept low)")
EMI = ("@{EMILIO_VILLASENOR} (37-year-old Mexican mestizo man, brown skin, short black curly hair, completely clean-shaven face, no hat, no glasses, "
       "dark brown corduroy jacket over a cream knit sweater, his hands open)")
AUR = ("@{AURORA_VILLASENOR} (76-year-old Mexican woman, light brown skin, gentle dignified face, white hair in an elegant low bun, no hat, no glasses, "
       "long-sleeve navy blue dress, one cream knitted shawl over her shoulders, one small gold brooch, her hands open)")
# QA intercambio c07/c23/c25/c27/c32: "the nativity" sin más -> Flow pone el nacimiento completo (María + Niño en el pesebre) -> se nombra lo que NO va
# QA 2 (regenerados c07/c15/c23/c25/c27/c32): con NOKID siguió saliendo el Niño en el pesebre y una María en los 6 -> la palabra "nativity" y las negaciones
# ("no manger", "no Child") arrastran el nacimiento completo. Ahora: sin "nativity" ni negaciones del pesebre; el establo se describe en positivo (3 figuras en fila,
# piso de madera liso y vacío) y en los planos de Aurora sentada el establo NO sale (mesita con lámpara y nochebuenas).
NOKID = "the stable floor in front of the three figures is flat bare wood, completely empty"
# QA padre-veladoras-p2 / medalla-mezcal-p2 / encendedor c11 / tele-nueva c19 / buen-hijo c29: utilería duplicada o deformada -> cada objeto, uno solo y simple
# QA intercambio c15/c24/c32: salió una Guadalupe (rayos dorados, ángel a los pies, madera sin pintar) -> se describe lo que NO es
VIR = ("one single carved wooden figure of the Virgin Mary @{PROP_VIRGENCASIMIRO}, about 30 cm tall, standing with her hands joined, her cloak painted pale sky blue with faded gold trim, "
       "her robe painted ivory white, thin glued cracks visible across the wood, a plain round wooden base, exactly as in its reference image, one solid piece; "
       "not Our Lady of Guadalupe: no golden rays or sunburst around her, no angel or moon at her feet, not bare unpainted wood; no second figure of her anywhere")
NAC = ("on the side table one small rustic wooden shed with a pitched roof, and inside it exactly three carved wooden figures standing in one straight row: "
       f"a standing bearded man in a brown robe holding a staff, an ox and a donkey, with an empty space at the man's side; {NOKID}")
NAC2 = ("on the side table one small rustic wooden shed with a pitched roof, and inside it exactly three carved wooden figures standing in one straight row: "
        f"a standing bearded man in a brown robe holding a staff, an ox and a donkey; right beside the bearded man stands {VIR}; {NOKID}")
SEAT = "sitting in a carved wooden armchair in the CENTER; beside her a small side table with one lamp and red poinsettias, nothing else on it"
APRON = "one plain white cotton apron, neatly folded and tied with a thin red ribbon bow"
BOX = "one plain brown cardboard box tied with a red ribbon"
WBOX = "one small closed white gift box with a gold ribbon"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / regreso-20 c06 / camionero c16: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

CLIPS = [
 # 1. Gancho / humillación en el intercambio: Constanza habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT by the Christmas tree, a proud half smile, she holds out {APRON} on her open palms", "LEFT",
     NODOUBLE("woman in a green velvet dress")), "proud, mocking, slow")),
 ("c02", 6, talk("c02", "Fabiola", one(f"Close-up of {FAB} {SAL}, standing on the LEFT by the doorway, hurt and dignified, she holds {APRON} against her chest", "RIGHT",
     NODOUBLE("woman in a wine-red sweater")), "hurt, quiet, dignified")),
 ("c03", 8, talk("c03", "Germán", one(f"Close-up of {GER} {SAL}, standing on the RIGHT by the Christmas tree, a lazy amused smile, one open hand turned up", "LEFT"),
     "amused, mocking, relaxed")),
 ("c04", 8, talk("c04", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, she raises her eyebrows, a cold smile", "LEFT"),
     "cold, mocking, slow")),
 ("c05", 8, talk("c05", "Fabiola", one(f"Close-up of {FAB} {SAL}, standing on the LEFT, she holds {BOX} in both hands against her chest, she lifts her chin", "RIGHT"),
     "hurt, firm, controlled, she says the word medianoche as one single word, me-dia-no-che")),  # QA: Whisper oyó "media de anoche"
 ("c06", 8, talk("c06", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, a satisfied smile, she holds {WBOX} in both hands", "LEFT",
     NODOUBLE("woman in a green velvet dress")), "proud, satisfied, condescending")),
 ("c07", 8, talk("c07", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, a polite sad smile, her eyes shine, one hand resting on the armrest", "RIGHT"),
     "gentle, sad, polite")),
 ("c08", 8, talk("c08", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, impatient, she sighs and tilts her head", "LEFT"),
     "impatient, cold, dismissive")),
 ("r1", 6, one(f"Close-up of {EMI} {SAL}, standing on the LEFT by the doorway, in silence, uneasy, he lowers his eyes and breathes", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. Patio (farolitos encendidos): Emilio quiere irse; Fabiola revela al espectador que tiene la Virgen
 ("c09", 6, talk("c09", "Emilio", one(f"Close-up of {EMI} {PAT}, standing on the RIGHT, worried, he lowers his voice, one open hand raised a little", "LEFT"),
     "worried, low, kind")),
 ("c10", 6, talk("c10", "Fabiola", one(f"Close-up of {FAB} {PAT}, standing on the LEFT, she holds {BOX} in both hands, calm and decided", "RIGHT"),
     "calm, firm, quiet")),
 ("c11", 8, talk("c11", "Emilio", one(f"Close-up of {EMI} {PAT}, standing on the RIGHT, nervous, he glances back toward the house, then back", "LEFT"),
     "nervous, low, unsure")),
 ("c12", 8, talk("c12", "Fabiola", one(f"Close-up of {FAB} {PAT}, standing on the LEFT, {BOX} in her hands, serious, her eyes shine", "RIGHT"),
     "serious, low, hurt")),
 ("c13", 8, talk("c13", "Fabiola", one(f"Close-up of {FAB} {PAT}, standing on the LEFT, {BOX} in her hands, a small brave smile, she nods once", "RIGHT"),
     "firm, warm, decided")),
 # 3. Sala a la medianoche: el regalo de Fabiola (Aurora CENTRO sentada; Constanza y Germán DER.; Fabiola y Emilio IZQ.)
 ("c14", 6, talk("c14", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, a mocking smile, both hands open low", "LEFT",
     NODOUBLE("woman in a green velvet dress")), "mocking, sweet, condescending")),
 ("i1", 6, f"Close-up insert {SAL}: on the carved dark wooden side table, a woman's hands in a wine-red knit sleeve untie the red ribbon of {BOX}, open it and lift out of the straw {VIR}. "
           f"No faces, no readable words, no other hands. No dialogue."),
 ("c15", 8, talk("c15", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, she holds {VIR} in both hands, her eyes shine, a trembling smile", "LEFT",
     NODOUBLE("white-haired woman or person in white")),
     "moved, quiet, amazed")),
 ("c16", 8, talk("c16", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, her smile frozen, surprised, then she shakes her head", "LEFT"),
     "surprised, quick, defensive")),
 ("c17", 6, talk("c17", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, she holds {VIR} and turns it slowly in her hands, serious", "RIGHT"),
     "calm, serious, firm")),
 ("c18", 8, talk("c18", "Fabiola", one(f"Close-up of {FAB} {SAL}, standing on the LEFT by the doorway, calm and dignified, her hands open", "RIGHT",
     NODOUBLE("woman in a wine-red sweater") + "; no subtitles at any moment, not even during her long first sentence; "
     "the lower half of the frame shows only her sweater and the room"), "calm, sure, dignified")),
 ("r2", 6, one(f"Close-up of {CON} {SAL}, standing on the RIGHT, in silence, her proud smile slowly disappears and she lowers her eyes", "LEFT") + " Slow push-in. No dialogue."),
 ("c19", 6, talk("c19", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, a small nervous smile, both hands open in front of her chest", "LEFT"),
     "nervous, quick, sweet")),
 ("c20", 8, talk("c20", "Emilio", one(f"Close-up of {EMI} {SAL}, standing on the LEFT by the doorway, nervous but brave, he lifts his chin, his hands open", "RIGHT"),
     "nervous, brave, honest")),
 ("r3", 6, one(f"Close-up of {GER} {SAL}, standing on the RIGHT by the Christmas tree, in silence, his smile slowly disappears and he looks away", "LEFT") + " Slow push-in. No dialogue."),
 # 4. El giro de poder
 ("c21", 8, talk("c21", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, {VIR} resting on her lap, she turns her head to the RIGHT, hurt and firm", "RIGHT"),
     "hurt, firm, slow")),
 ("c22", 8, talk("c22", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, upset, her jaw tight, hands open low", "LEFT"),
     "upset, low, defensive")),
 ("c23", 6, talk("c23", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, calm and firm, she shakes her head slowly", "RIGHT"),
     "calm, firm, wise")),
 ("c24", 8, talk("c24", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, firm, she nods once, {VIR} resting on her lap", "RIGHT"),
     "firm, calm, final")),
 ("c25", 6, talk("c25", "Aurora", one(f"Close-up of {AUR} {SAL}, {SEAT}, a tiny serious smile, she holds {APRON} out on her open palms toward the RIGHT", "RIGHT"),
     "calm, dry, final")),
 ("c26", 6, talk("c26", "Constanza", one(f"Close-up of {CON} {SAL}, standing on the RIGHT, she holds {APRON} in both hands, humiliated, a forced cold smile", "LEFT"),
     "cold, quiet, swallowing her pride")),
 # 5. Payoff (cama cálida): Fabiola pone la Virgen en el nacimiento
 ("c27", 6, talk("c27", "Fabiola", one(f"Close-up of {FAB} {SAL}, standing on the LEFT beside the side table, she holds {VIR}; she gently places it beside the bearded man figure inside the small wooden shed, "
     f"{NAC}, eyes shining, a grateful smile", "RIGHT"), "moved, warm, soft")),
 ("c28", 8, talk("c28", "Emilio", one(f"Close-up of {EMI} {SAL}, standing on the RIGHT, eyes shining, a sincere ashamed smile, one hand on his chest", "LEFT"),
     "sincere, warm, ashamed")),
 # 6. Gancho para la Parte 2 (patio de noche, casi a oscuras: Constanza IZQ., Germán DER.)
 ("c29", 8, talk("c29", "Constanza", one(f"Close-up of {CON} {PATN}, standing on the LEFT in the shadows, a cold quiet smile, she glances back toward the house", "RIGHT",
     NODOUBLE("woman in a green velvet dress")), "cold, quiet, menacing")),
 ("c30", 6, talk("c30", "Germán", one(f"Close-up of {GER} {PATN}, standing on the RIGHT, puzzled, he frowns", "LEFT"),
     "puzzled, low, curious")),
 ("c31", 10, talk("c31", "Constanza", one(f"Close-up of {CON} {PATN}, standing on the LEFT, serious, she leans a little closer and lowers her voice", "RIGHT"),
     "cold, low, worried")),
 ("r4", 6, f"Medium close-up of {FAB} {SAL}, the room lights dimmed, only the Christmas tree glowing, standing alone beside the side table; she holds {VIR} in both hands, "
           f"turns it over and looks closely at the bottom of its plain round wooden base, puzzled, she frowns slightly; "
           f"{SOLO}; she is the only person in the whole shot, already in place from the very first frame; no hands or arms entering from the edges. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Fabiola junto al nacimiento, a cámara
 # QA 3: la hoja LOC_SALANAVIDAD2 trae un pesebre diminuto con Niño entre el burro y José, y c32 v3 salió con Niño + una María -> sin la hoja de la sala
 # y sin establo en cuadro: solo la Virgen sobre la mesita (c27 ya muestra el establo, recortado)
 ("c32", 10, talk("c32", "Fabiola", f"Medium close-up of {FAB} {SAL.replace(' @{LOC_SALANAVIDAD2}', '')}, alone, standing beside the side table where {VIR} stands on its own, nothing else on the table, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she touches the base of that pale blue painted Virgin, tilts her head, raises her eyebrows, nods and smiles. "
     f"The living room behind her is empty, no other people.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"), ("commanding", "firm"),
        ("ashamed", "humble"), ("humiliated", "quiet"), ("swallowing her pride", "quiet"), ("stammering", "quiet"), ("fake polite", "polite"), ("forced", "small"),
        ("eyes wide", "eyes open"), ("eyes open wide", "eyes open"), ("condescending", "polite"), ("dismissive", "calm"),
        ("jaw tight", "serious face"), ("swallows", "breathes"), ("hurt", "sad"), ("in the shadows", "in soft light"), ("deep shadows", "soft shadows"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("nervous", "quiet"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("defeated", "quiet"),
        ("¡", ""), ("!", "."), ("cuál es tu lugar en esta casa", "cómo se hacen las cosas en esta casa"), ("que nos da pena", "mejor"),
        ("la tiró a la basura", "la dejó afuera"), ("en el bote de basura", "afuera"), ("se nos acaba todo", "se nos complica todo")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, wealthy Mexican family house on Christmas Eve, warm soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family Christmas drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{FABIOLA_OCHOA}", "a Mexican woman"), ("@{CONSTANZA_VILLASENOR}", "an elegant Mexican woman"),
         ("@{GERMAN_ALTAMIRANO}", "a Mexican man"), ("@{EMILIO_VILLASENOR}", "a Mexican man"),
         ("@{AURORA_VILLASENOR}", "a Mexican grandmother"), ("@{PROP_VIRGENCASIMIRO}", "")]
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
