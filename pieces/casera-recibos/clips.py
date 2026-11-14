"""Genera los clips de casera-recibos PARTE 1 (La Casera de los Recibos, historia propia navideña inspirada en la ref 7702576886957755670 de @relatos.de.vida.9, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
#   Patio de la casa de huéspedes, de día (c01-c04, c09-c13, r2): Chelo a la DERECHA junto a la puerta; Maricela a la IZQUIERDA.
#   Cocina (c05-c08, r1): Maricela a la IZQUIERDA; Nancy y (c08, junto a la puerta) Chelo a la DERECHA.
#   Banqueta de noche frente a la casa (c14-c16, r3): Maricela a la IZQUIERDA sentada en su maleta; Nancy (en la puerta) y Pachita a la DERECHA.
#   Sala de Pachita, de noche (c17-c20): Maricela a la IZQUIERDA en el sofá con su jarrito; Pachita a la DERECHA.
#   Oficina del hospital (c21-c29): Maricela a la IZQUIERDA; Graciela a la DERECHA detrás de su escritorio.
#   Gancho (c30-c31): Chelo sola en el patio de noche, al teléfono. (c32, r4): Graciela sola en su oficina, al teléfono.
#   CTA (c33): Maricela sola en la sala de Pachita, a cámara.
# Navidad (1 de cada 3 piezas): posada, piñata, ponche, Nochebuena. SIN nacimiento, sin Niño, sin dinero ni aguinaldo navideño, sin niños.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): UN solo adorno navideño por locación, sin letreros ni marcas.
PAT = ("in the small front patio @{LOC_PATIOCHELO} of a boarding house in a Mexican city in December, in the morning: a plain terracotta wall, one old wooden door, "
       "one string of small warm Christmas lights above the door, one red star-shaped piñata hanging from a rope; soft cool daylight; "
       "no readable text, no signs, no logos, no nativity scene; no extras, nobody else in the patio besides the person described")
PATT = PAT.replace("in the morning", "in the late afternoon").replace("soft cool daylight", "warm low afternoon light")
PATN = PAT.replace("in the morning", "at night").replace("soft cool daylight", "dark cold night lit only by the warm Christmas lights and one porch bulb")
STR = ("on the sidewalk in front of the boarding house @{LOC_PATIOCHELO} in a Mexican city in December, at night: the plain terracotta wall, the old wooden door, "
       "one string of small warm Christmas lights above the door; dark cold night lit only by the Christmas lights and one porch bulb; "
       "no readable text, no signs, no logos, no nativity scene; no extras, nobody else on the sidewalk besides the person described")
KIT = ("in the simple kitchen @{LOC_COCINACHELO} of the boarding house: a plain pale yellow wall, one table with a plain red and white checked oilcloth, "
       "one plain white fridge with nothing stuck on it, one steel pot on an old stove; soft window daylight; no readable text, no papers on the walls, no logos, no decorations; "
       "no extras, nobody else in the kitchen besides the person described")
SAL = ("in the humble living room @{LOC_SALAPACHITA} at night in December: one old brown sofa, one small wooden table with one clay pot of hot ponche and small clay mugs, "
       "one window with a single string of small warm Christmas lights; cozy warm lamp light, light steam from the pot; no nativity scene, no religious images, no readable text, no logos; "
       "no extras, nobody else in the room besides the person described")
OFI = ("in a plain small office @{LOC_OFIHOSPITAL} of a city hospital: one wooden desk with a few plain folders, a plain pale green wall, one window with daylight; "
       "clean soft light; no readable text, no signs, no logos, no posters, no medical equipment; no extras, nobody else in the office besides the person described")
OFIN = OFI.replace("one window with daylight", "one dark window at night").replace("clean soft light", "one warm desk lamp")
# Anclas de identidad y ropa (atuendos de la ref con otros colores: la estudiante de trenza y sudadera guinda -> enfermera adulta de suéter azul marino;
# la casera de bata morada floreada -> bata verde esmeralda; la amiga de chamarra de mezclilla y lentes -> chamarra polar lila, sin lentes; la licenciada de blazer verde -> blazer gris carbón).
# NADIE lleva sombrero, gorra ni lentes. Manos abiertas, nadie señala con el dedo. Sin uniformes de enfermera, gafetes ni letras en la ropa.
# Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27). Maricela y Nancy, claramente adultas (más de 30).
MAR = ("@{MARICELA_ORNELAS} (31-year-old Mexican woman, clearly an adult, brown skin, kind tired face with determined eyes, shoulder-length straight black hair tucked behind her ears, "
       "no hat, no glasses, navy blue knitted sweater, dark jeans, small gold stud earrings, her hands kept low)")
CHE = ("@{CHELO_VALDIVIA} (63-year-old Mexican woman, light brown skin, hard round face, short permed copper-red dyed hair, no hat, no glasses, "
       "emerald green housedress with small white flowers, thin gold chain, gold earrings, her hands kept low, she never points a finger at anyone)")
NAN = ("@{NANCY_GUILLEN} (33-year-old Mexican woman, clearly an adult, light brown skin, nervous gentle face, curly brown shoulder-length hair, no hat, no glasses, "
       "lilac fleece jacket over a plain white t-shirt, her hands kept low)")
PAC = ("@{PACHITA_ROBLES} (76-year-old Mexican woman, brown skin, sweet wrinkled face, white hair in a low bun, no hat, no glasses, "
       "red knitted shawl over a plain grey dress, small pearl earrings, her hands kept low and open)")
GRA = ("@{GRACIELA_MONDRAGON} (52-year-old Mexican woman, light brown skin, serious sharp face, short brown hair with one grey streak, no hat, no glasses, no badge, "
       "charcoal grey blazer over a plain white blouse, her hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
RECIBO = "one folded plain white paper with no readable writing held low in her RIGHT hand"
LIBRETA = "one small closed brown notebook held in her RIGHT hand"
MALETAS = "two plain dark blue suitcases on the ground beside her"
JARRO = "one small clay mug of hot ponche held in both hands"
CALL = "one black smartphone held to her ear with her RIGHT hand"
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
 # 1. Gancho / el recibo (patio, mañana): Maricela habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Maricela", one(f"Close-up of {MAR} {PAT}, standing on the LEFT, {RECIBO}, she lifts the paper a little, firm and respectful", "RIGHT",
     NODOUBLE("woman in a navy sweater")), "firm, respectful, serious")),
 ("c02", 8, talk("c02", "Chelo", one(f"Close-up of {CHE} {PAT}, standing on the RIGHT by the wooden door, a cold superior smile, chin up", "LEFT",
     NODOUBLE("woman in an emerald green housedress")), "cold, superior, sarcastic")),
 ("c03", 8, talk("c03", "Maricela", one(f"Close-up of {MAR} {PAT}, standing on the LEFT, {RECIBO}, calm and firm", "RIGHT"),
     "calm, firm, brave")),
 ("c04", 8, talk("c04", "Chelo", one(f"Close-up of {CHE} {PAT}, standing on the RIGHT by the door, a mocking smile that turns cold", "LEFT"),
     "mocking, cold, threatening")),
 # 2. La cocina: nadie se atreve
 ("c05", 6, talk("c05", "Nancy", one(f"Close-up of {NAN} {KIT}, standing on the RIGHT by the table, scared, she speaks low and glances toward the door", "LEFT",
     NODOUBLE("woman in a lilac fleece jacket")), "scared, whispering, urgent")),
 ("c06", 6, talk("c06", "Maricela", one(f"Close-up of {MAR} {KIT}, standing on the LEFT by the table, serious, she lowers her voice", "RIGHT",
     NODOUBLE("woman in a navy sweater")), "serious, quiet, gentle")),
 ("c07", 8, talk("c07", "Nancy", one(f"Close-up of {NAN} {KIT}, standing on the RIGHT, she lowers her eyes, ashamed and sad", "LEFT"),
     "sad, ashamed, quiet")),
 ("c08", 8, talk("c08", "Chelo", one(f"Close-up of {CHE} {KIT}, standing on the RIGHT by the kitchen door, a false sweet smile, her arms crossed", "LEFT",
     NODOUBLE("woman in an emerald green housedress")), "falsely sweet, cold, bossy")),
 # QA v1 r1: habló una frase inventada ("No sé qué vamos a hacer...") y entró caminando desde el borde DER. -> labios cerrados, quieta desde el 1er frame, sin voz.
 ("r1", 6, one(f"Close-up of {NAN} {KIT}, standing still on the RIGHT by the table, already in the center of the frame from the first frame, in silence with her lips closed the whole time, she lowers her eyes, worried, and holds her own hands", "LEFT") + " Slow push-in, the camera never pans. She never speaks: no dialogue, no voice, no words, only quiet room tone."),
 # 3. La posada y la amenaza (patio, tarde): Chelo acomoda la piñata
 ("c09", 8, talk("c09", "Chelo", one(f"Close-up of {CHE} {PATT}, standing on the RIGHT under the hanging red star piñata, she touches one of its points, a cold smile", "LEFT"),
     "cheerful, cold, cruel")),
 ("c10", 8, talk("c10", "Maricela", one(f"Close-up of {MAR} {PATT}, standing on the LEFT, worried, her eyes shine", "RIGHT",
     NODOUBLE("woman in a navy sweater")), "worried, pleading, soft")),
 ("c11", 8, talk("c11", "Chelo", one(f"Close-up of {CHE} {PATT}, standing on the RIGHT, cold and firm, she shrugs", "LEFT"),
     "cold, firm, cruel")),
 ("c12", 6, talk("c12", "Maricela", one(f"Close-up of {MAR} {PATT}, standing on the LEFT, firm, her eyes shine, chin up", "RIGHT"),
     "firm, hurt, brave")),
 ("c13", 8, talk("c13", "Chelo", one(f"Close-up of {CHE} {PATT}, standing on the RIGHT by the door, a proud arrogant smile", "LEFT",
     NODOUBLE("woman in an emerald green housedress")), "proud, arrogant, mocking")),
 ("r2", 6, one(f"Close-up of {MAR} {PATT}, standing on the LEFT, in silence, she narrows her eyes slowly, thinking, as if she just understood something", "RIGHT") + " Slow push-in. No dialogue."),
 # 4. El desalojo (banqueta, de noche, a dos días de Nochebuena)
 ("c14", 8, talk("c14", "Nancy", one(f"Close-up of {NAN} {STR}, standing on the RIGHT in the half-open wooden doorway, sad and scared, she speaks low", "LEFT",
     NODOUBLE("woman in a lilac fleece jacket")), "sad, scared, whispering")),
 ("c15", 8, talk("c15", "Maricela", one(f"Close-up of {MAR} {STR}, sitting on the LEFT on one of her suitcases, {MALETAS}, cold, her breath visible, a brave small smile", "RIGHT"),
     "brave, sad, determined")),
 ("r3", 6, one(f"Close-up of {MAR} {STR}, sitting alone on the LEFT on her suitcase, in silence, {MALETAS}, she hugs herself in the cold, the Christmas lights blurred behind her", "RIGHT") + " Slow push-in. No dialogue."),
 ("c16", 8, talk("c16", "Pachita", one(f"Close-up of {PAC} {STR}, standing on the RIGHT, worried and tender, she pulls her red shawl tighter", "LEFT",
     NODOUBLE("old woman in a red shawl")), "tender, worried, warm")),
 # 5. El ponche de doña Pachita (sala, de noche): entra la cama cálida
 ("c17", 8, talk("c17", "Maricela", one(f"Close-up of {MAR} {SAL}, sitting on the LEFT on the brown sofa, {JARRO}, grateful, her eyes shine", "RIGHT",
     NODOUBLE("woman in a navy sweater")), "grateful, sad, soft")),
 ("c18", 8, talk("c18", "Pachita", one(f"Close-up of {PAC} {SAL}, sitting on the RIGHT, she shakes her head slowly, knowing", "LEFT"),
     "knowing, warm, frank")),
 ("c19", 8, talk("c19", "Maricela", one(f"Close-up of {MAR} {SAL}, sitting on the LEFT on the sofa, {JARRO}, she looks up, her face lights up with an idea", "RIGHT"),
     "thoughtful, hopeful, quiet")),
 ("c20", 6, talk("c20", "Pachita", one(f"Close-up of {PAC} {SAL}, sitting on the RIGHT, a sly sweet smile, she nods", "LEFT",
     NODOUBLE("old woman in a red shawl")), "sly, sweet, encouraging")),
 # 6. El hospital (oficina, de día)
 ("c21", 8, talk("c21", "Maricela", one(f"Close-up of {MAR} {OFI}, standing on the LEFT in front of the desk, nervous but firm", "RIGHT",
     NODOUBLE("woman in a navy sweater")), "nervous, firm, respectful")),
 ("c22", 6, talk("c22", "Graciela", one(f"Close-up of {GRA} {OFI}, sitting on the RIGHT behind her wooden desk, skeptical, her hands folded on the desk", "LEFT",
     NODOUBLE("woman in a charcoal blazer")), "skeptical, formal, calm")),
 ("c23", 8, talk("c23", "Maricela", one(f"Close-up of {MAR} {OFI}, standing on the LEFT, her eyes shine, firm", "RIGHT"),
     "hurt, firm, brave")),
 ("c24", 8, talk("c24", "Maricela", one(f"Close-up of {MAR} {OFI}, standing on the LEFT, {LIBRETA}, she holds the closed notebook out a little toward the desk", "RIGHT"),
     "firm, calm, determined")),
 ("c25", 8, talk("c25", "Graciela", one(f"Close-up of {GRA} {OFI}, sitting on the RIGHT behind her desk, serious, she taps the desk once with two fingers", "LEFT"),
     "serious, fair, formal")),
 ("c26", 6, talk("c26", "Maricela", one(f"Close-up of {MAR} {OFI}, standing on the LEFT, she shakes her head a little, worried", "RIGHT"),
     "worried, frank, quiet")),
 ("c27", 6, talk("c27", "Graciela", one(f"Close-up of {GRA} {OFI}, sitting on the RIGHT, a slow clever smile appears", "LEFT",
     NODOUBLE("woman in a charcoal blazer")), "clever, calm, intrigued")),
 ("c28", 6, talk("c28", "Maricela", one(f"Close-up of {MAR} {OFI}, standing on the LEFT, surprised, then she nods", "RIGHT"),
     "surprised, hopeful, quiet")),
 ("c29", 6, talk("c29", "Graciela", one(f"Close-up of {GRA} {OFI}, sitting on the RIGHT, decided, a small confident smile", "LEFT"),
     "decided, confident, sly")),
 # 7. Gancho para la Parte 2 (vuelve el suspenso): Chelo le renta el cuarto a la "nueva"
 ("c30", 8, talk("c30", "Chelo", one(f"Close-up of {CHE} {PATN}, standing alone by the wooden door under the Christmas lights, {CALL}, a sweet false smile", "LEFT",
     NODOUBLE("woman in an emerald green housedress")), "sweet, false, friendly")),
 ("c31", 6, talk("c31", "Chelo", one(f"Close-up of {CHE} {PATN}, standing alone by the door, {CALL}, a greedy satisfied smile", "LEFT"),
     "satisfied, sweet, sly")),
 ("c32", 6, talk("c32", "Graciela", one(f"Close-up of {GRA} {OFIN}, sitting alone behind her desk, {CALL}, calm, a polite voice and a knowing look", "RIGHT",
     NODOUBLE("woman in a charcoal blazer")), "polite, calm, knowing")),
 ("r4", 6, one(f"Close-up of {GRA} {OFIN}, sitting alone behind her desk, in silence, she lowers the black phone slowly and smiles to herself, a sly knowing look to the side", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Maricela en la sala de Pachita, a cámara
 ("c33", 10, talk("c33", "Maricela", f"Medium close-up of {MAR} {SAL}, alone, sitting on the brown sofa with one small clay mug of ponche, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she lifts the mug a little, tilts her head, raises her eyebrows, nods and smiles. "
     f"Nobody else in the room.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("sarcastic", "dry"), ("superior", "proud"), ("arrogant", "proud"), ("greedy", "pleased"), ("falsely sweet", "sweet"), ("false", "soft"),
        ("sly", "calm"), ("whispering", "speaking softly"), ("ashamed", "humble"), ("pleading", "soft"), ("hurt", "serious"), ("bossy", "firm"), ("skeptical", "serious"),
        ("her arms crossed", "her hands low"), ("hugs herself in the cold", "sits still in the cold"), ("her breath visible", "the night air cold"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("cold", "serious"), ("nervous", "quiet"),
        ("¡", ""), ("!", "."), ("la que reclama se va", "la que reclama no dura"), ("me echó por sacarle las cuentas", "me sacó de la casa por las cuentas"),
        ("te me vas, con todo y maletas", "ya no duermes aquí"), ("la corre", "la saca")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama in December, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a boarding house in a Mexican city at Christmas time, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican neighborhood drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{MARICELA_ORNELAS}", "a Mexican nurse in plain clothes"), ("@{CHELO_VALDIVIA}", "a Mexican landlady"),
         ("@{NANCY_GUILLEN}", "a Mexican tenant"), ("@{PACHITA_ROBLES}", "an old Mexican neighbor lady"),
         ("@{GRACIELA_MONDRAGON}", "a Mexican hospital manager"),
         (" @{LOC_PATIOCHELO}", ""), (" @{LOC_COCINACHELO}", ""), (" @{LOC_SALAPACHITA}", ""), (" @{LOC_OFIHOSPITAL}", "")]
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
