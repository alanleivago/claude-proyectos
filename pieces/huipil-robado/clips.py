"""Genera los clips de huipil-robado PARTE 1 (El Huipil Robado, historia propia inspirada en la ref 7701016469173292310 de @relatos.de.vida.9, VISTA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
#   Patio de Tomasa, escena 1 (c01-c05, r1): Romina a la DERECHA de pie; Tomasa y Yaretzi a la IZQUIERDA.
#   Patio de Tomasa, escenas 2, 3 y 5 (c06-c13, r2, c17-c20): Tomasa a la IZQUIERDA sentada a su mesa; Yaretzi y Crescencia a la DERECHA.
#   Boutique de Romina (c14-c16): Romina sola al teléfono, mira a la IZQUIERDA (c16: sonrisa hacia la DERECHA).
#   Feria (c21-c29, r3): Ofelia y Romina a la DERECHA; Tomasa y Yaretzi a la IZQUIERDA.
#   Calle de noche (c30-c34, r4): Tomasa a la IZQUIERDA sentada en una caja; Crescencia y Yaretzi a la DERECHA.
#   CTA (c35): Tomasa sola en la calle de noche, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin precios, sin marcas, sin adornos.
PAT = ("in the adobe patio @{LOC_PATIOTOMASA} of a house in a mountain village of Oaxaca on a cloudy day: plain ochre adobe wall, one simple wooden table "
       "with a few folded white embroidered blouses, one wooden bench, soft green hills far behind; soft overcast daylight; no readable text, no signs, no logos; "
       "no extras, nobody else in the patio besides the person described")
PATT = PAT.replace("on a cloudy day", "in the late afternoon").replace("soft overcast daylight", "warm low afternoon light")
BOU = ("inside the small city boutique @{LOC_BOUTIQUEROM}: a plain white wall, one black metal clothes rack with white embroidered blouses on hangers, "
       "one plain white counter; clean white interior light; no readable text, no signs, no price tags, no logos, no mannequins; "
       "no extras, nobody else in the shop besides the person described")
FER = ("at the craft fair @{LOC_FERIACARPA} under a plain white canopy tent in a city plaza in the morning: one bare wooden table with a plain white cloth, "
       "soft diffused daylight; no balloons, no banners, no readable text, no signs, no logos; "
       "no extras, nobody else under the tent besides the person described")
CAL = ("on a quiet cobblestone street @{LOC_CALLEFERIA} at night: a plain yellow colonial wall, one warm old street lamp, two plain brown cardboard boxes on the ground; "
       "warm lamp light with soft dark shadows; no readable text, no signs, no logos; "
       "no extras, nobody else on the street besides the person described")
# Anclas de identidad y ropa (atuendos de la ref con otros colores: la bordadora de blusa blanca con flores rojas y rebozo azul -> flores moradas y rebozo vino;
# la nieta de sudadera gris -> sobrina adulta de cárdigan verde; la dueña de lino beige -> blazer marfil y chongo bajo; la amiga de rebozo morado -> rebozo mostaza).
# NADIE lleva sombrero, gorra ni lentes (tampoco lentes de sol en la cabeza). Manos abiertas, nadie señala con el dedo. Sin uniformes, gafetes ni letras en la ropa.
# Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27). Bordados genéricos y respetuosos, sin patrones de una comunidad concreta.
TOM = ("@{TOMASA_SANABRIA} (64-year-old Mexican Indigenous woman, brown skin, dignified weathered face with deep kind lines, two long grey braids, no hat, no glasses, "
       "white cotton blouse embroidered with purple and yellow flowers at the chest, a wine red rebozo shawl over her shoulders, black skirt, her hands kept low and open)")
YAR = ("@{YARETZI_SANABRIA} (29-year-old Mexican woman, clearly an adult, brown skin, determined face, long straight black hair in a low ponytail, no hat, no glasses, "
       "forest green knitted cardigan over a plain cream t-shirt, dark jeans, small silver earrings, her hands kept low)")
ROM = ("@{ROMINA_ARRIOLA} (42-year-old Mexican woman, fair skin, elegant cold face, sleek dark brown hair in a low bun, red lipstick, no hat, no glasses, no sunglasses, "
       "ivory linen blazer over a plain black top, thin gold necklace, her hands kept low, she never points a finger at anyone)")
CRE = ("@{CRESCENCIA_LOPEZ} (60-year-old Mexican Indigenous woman, brown skin, round worried face, grey hair pulled back in a low bun, no hat, no glasses, "
       "light blue blouse with small white embroidery at the collar, a mustard yellow rebozo shawl over her shoulders, dark brown skirt, her hands kept low)")
OFE = ("@{OFELIA_FERIA2} (50-year-old Mexican woman, light brown skin, tired polite face, short wavy brown hair, no hat, no glasses, no badge, "
       "plain teal blouse under a grey cardigan, one plain beige clipboard held against her chest, her hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
BLOUSE = "one white embroidered blouse with purple and yellow flowers held in both hands"
PHONE = "one black smartphone held low in her RIGHT hand, its screen turned away from the camera"
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
 # 1. Gancho / humillación (patio de Tomasa, día nublado): Romina habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Romina", one(f"Close-up of {ROM} {PAT}, standing on the RIGHT, {BLOUSE}, she looks down at the embroidery with a cold disdainful smile", "LEFT",
     NODOUBLE("woman in an ivory blazer")), "cold, condescending, smug")),
 ("c02", 8, talk("c02", "Tomasa", one(f"Close-up of {TOM} {PAT}, standing on the LEFT, calm and dignified, a hurt look in her eyes", "RIGHT",
     NODOUBLE("woman in a wine red rebozo")), "dignified, hurt, calm")),
 ("c03", 8, talk("c03", "Romina", one(f"Close-up of {ROM} {PAT}, standing on the RIGHT, she shrugs lightly, arrogant", "LEFT"),
     "arrogant, cold, dismissive")),
 ("c04", 6, talk("c04", "Yaretzi", one(f"Close-up of {YAR} {PAT}, standing on the LEFT, she raises her eyebrows, suspicious and calm", "RIGHT",
     NODOUBLE("woman in a green cardigan")), "suspicious, calm, sharp")),
 ("c05", 8, talk("c05", "Romina", one(f"Close-up of {ROM} {PAT}, standing on the RIGHT, a tight cold smile, chin up", "LEFT"),
     "cold, superior, sweet-sounding")),
 ("r1", 6, one(f"Close-up of {TOM} {PAT}, standing on the LEFT, in silence, she presses a folded white embroidered blouse against her chest and lowers her eyes", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. La revelación (patio, tarde): solo Yaretzi ve la pantalla
 ("c06", 8, talk("c06", "Yaretzi", one(f"Close-up of {YAR} {PATT}, standing on the RIGHT, {PHONE}, she looks up from the phone, shocked", "LEFT",
     NODOUBLE("woman in a green cardigan")), "shocked, urgent, quiet")),
 ("c07", 8, talk("c07", "Tomasa", one(f"Close-up of {TOM} {PATT}, sitting on the LEFT at her wooden table, she leans forward, her eyes shine, a hand on her chest", "RIGHT"),
     "moved, surprised, soft")),
 ("c08", 8, talk("c08", "Yaretzi", one(f"Close-up of {YAR} {PATT}, standing on the RIGHT, {PHONE}, she reads from the phone, indignant", "LEFT"),
     "indignant, firm, hurt")),
 ("c09", 8, talk("c09", "Tomasa", one(f"Close-up of {TOM} {PATT}, sitting on the LEFT at her wooden table, serious, her jaw tight, her eyes shine", "RIGHT",
     NODOUBLE("woman in a wine red rebozo")), "hurt, firm, quiet")),
 ("r2", 6, one(f"Close-up of {YAR} {PATT}, standing on the RIGHT, in silence, she lowers the black phone slowly, her eyes shine", "LEFT") + " Slow push-in. No dialogue."),
 # 3. La decisión (patio, tarde): entra la cama cálida
 ("c10", 8, talk("c10", "Yaretzi", one(f"Close-up of {YAR} {PATT}, standing on the RIGHT, hopeful and decided, a small brave smile", "LEFT"),
     "hopeful, decided, warm")),
 ("c11", 8, talk("c11", "Crescencia", one(f"Close-up of {CRE} {PATT}, standing on the RIGHT, worried, her hands held together low", "LEFT",
     NODOUBLE("woman in a mustard rebozo")), "worried, fearful, honest")),
 ("c12", 8, talk("c12", "Tomasa", one(f"Close-up of {TOM} {PATT}, sitting on the LEFT at her wooden table, firm and calm, she nods once", "RIGHT"),
     "firm, calm, brave")),
 ("c13", 8, talk("c13", "Crescencia", one(f"Close-up of {CRE} {PATT}, standing on the RIGHT, she sighs and then smiles a little", "LEFT"),
     "resigned, warm, a little playful")),
 # 4. La villana mueve ficha (boutique)
 ("c14", 8, talk("c14", "Romina", one(f"Close-up of {ROM} {BOU}, standing alone by the counter, {CALL}, sweet false voice", "LEFT",
     NODOUBLE("woman in an ivory blazer")), "sweet, false, calculating")),
 ("c15", 8, talk("c15", "Romina", one(f"Close-up of {ROM} {BOU}, standing alone by the counter, {CALL}, her face turns cold and firm", "LEFT"),
     "cold, firm, calculating")),
 ("c16", 6, talk("c16", "Romina", one(f"Close-up of {ROM} {BOU}, standing alone by the counter, she lowers the black phone and smiles to herself, sly", "RIGHT"),
     "sly, satisfied, quiet")),
 # 5. Consecuencia (patio, tarde)
 ("c17", 8, talk("c17", "Crescencia", one(f"Close-up of {CRE} {PATT}, standing on the RIGHT, worried, she speaks fast and low", "LEFT",
     NODOUBLE("woman in a mustard rebozo")), "worried, urgent, quiet")),
 ("c18", 6, talk("c18", "Tomasa", one(f"Close-up of {TOM} {PATT}, sitting on the LEFT at her wooden table, she rests one hand on a folded white blouse, calm and serious", "RIGHT"),
     "calm, serious, sad")),
 ("c19", 6, talk("c19", "Crescencia", one(f"Close-up of {CRE} {PATT}, standing on the RIGHT, she shakes her head, upset", "LEFT"),
     "upset, worried, frank")),
 ("c20", 6, talk("c20", "Yaretzi", one(f"Close-up of {YAR} {PATT}, standing on the RIGHT, a brave small smile, she nods", "LEFT"),
     "brave, warm, encouraging")),
 # 6. El giro cruel (feria, mañana): vuelve el suspenso
 ("c21", 6, talk("c21", "Tomasa", one(f"Close-up of {TOM} {FER}, standing on the LEFT, {BLOUSE}, polite and hopeful", "RIGHT",
     NODOUBLE("woman in a wine red rebozo")), "polite, hopeful, humble")),
 ("c22", 6, talk("c22", "Ofelia", one(f"Close-up of {OFE} {FER}, standing on the RIGHT, uncomfortable, she looks down at her clipboard", "LEFT",
     NODOUBLE("woman in a teal blouse")), "uncomfortable, polite, firm")),
 ("c23", 6, talk("c23", "Yaretzi", one(f"Close-up of {YAR} {FER}, standing on the LEFT, surprised and annoyed", "RIGHT"),
     "surprised, annoyed, firm")),
 ("c24", 8, talk("c24", "Ofelia", one(f"Close-up of {OFE} {FER}, standing on the RIGHT, she shrugs, bureaucratic", "LEFT"),
     "bureaucratic, polite, cold")),
 ("c25", 8, talk("c25", "Tomasa", one(f"Close-up of {TOM} {FER}, standing on the LEFT, {BLOUSE}, she lifts the blouse a little, dignified, her eyes shine", "RIGHT"),
     "dignified, hurt, firm")),
 ("c26", 6, talk("c26", "Ofelia", one(f"Close-up of {OFE} {FER}, standing on the RIGHT, she looks away, uneasy", "LEFT"),
     "uneasy, polite, cold")),
 # 7. Remate de humillación (feria): Romina ya está en su lugar desde el primer frame
 ("c27", 8, talk("c27", "Romina", one(f"Close-up of {ROM} {FER}, standing on the RIGHT, a mocking sweet smile", "LEFT",
     NODOUBLE("woman in an ivory blazer")), "mocking, sweet, superior")),
 ("c28", 6, talk("c28", "Yaretzi", one(f"Close-up of {YAR} {FER}, standing on the LEFT, angry but controlled, chin up", "RIGHT",
     NODOUBLE("woman in a green cardigan")), "angry, controlled, firm")),
 ("c29", 6, talk("c29", "Romina", one(f"Close-up of {ROM} {FER}, standing on the RIGHT, cold, she smooths her blazer", "LEFT"),
     "cold, superior, calm")),
 ("r3", 6, one(f"Close-up of {TOM} {FER}, standing on the LEFT, in silence, {BLOUSE}, she watches someone walk away and breathes slowly, dignified", "RIGHT") + " Slow push-in. No dialogue."),
 # 8. Punto más bajo (calle de noche)
 ("c30", 8, talk("c30", "Crescencia", one(f"Close-up of {CRE} {CAL}, standing on the RIGHT, tired and sad, she pulls her mustard rebozo tighter", "LEFT",
     NODOUBLE("woman in a mustard rebozo")), "tired, sad, quiet")),
 ("c31", 8, talk("c31", "Yaretzi", one(f"Close-up of {YAR} {CAL}, standing on the RIGHT, her eyes shine, defeated", "LEFT"),
     "sad, defeated, soft")),
 # 9. Gancho para la Parte 2
 ("c32", 8, talk("c32", "Tomasa", one(f"Close-up of {TOM} {CAL}, sitting on the LEFT on a cardboard box, a slow knowing smile appears", "RIGHT",
     NODOUBLE("woman in a wine red rebozo")), "calm, knowing, mysterious")),
 ("c33", 6, talk("c33", "Yaretzi", one(f"Close-up of {YAR} {CAL}, standing on the RIGHT, curious, she frowns a little", "LEFT"),
     "curious, surprised, soft")),
 ("c34", 8, talk("c34", "Tomasa", one(f"Close-up of {TOM} {CAL}, sitting on the LEFT on a cardboard box, {BLOUSE}, she speaks low with a proud small smile", "RIGHT"),
     "proud, quiet, determined")),
 ("r4", 6, f"Close-up insert {CAL}: the old brown hands of {TOM} turn the inside of the sleeve of one white embroidered blouse and show one tiny embroidered hummingbird in purple thread; "
     f"only the hands and the cloth in frame, no face, no other hands, {SOLO}. Slow push-in. No dialogue. No text."),
 # CTA con carisma (después del BLACK): Tomasa en la calle de noche, a cámara
 ("c35", 10, talk("c35", "Tomasa", f"Medium close-up of {TOM} {CAL}, alone, sitting on a cardboard box, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she adjusts her wine red rebozo, tilts her head, raises her eyebrows, nods and smiles. "
     f"Nobody else on the street.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("false", "soft"), ("sly", "calm"),
        ("defeated", "quiet"), ("fearful", "quiet"), ("shocked", "surprised"), ("hurt", "serious"), ("uncomfortable", "quiet"), ("bureaucratic", "formal"),
        ("superior", "proud"), ("dismissive", "calm"), ("arrogant", "proud"), ("controlled", "calm"), ("uneasy", "quiet"), ("Indigenous ", ""),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("cold", "serious"),
        ("¡", ""), ("!", "."), ("que nadie más le compra", "así es esto"), ("desenmascarar a", "ganarle a"),
        ("copias de mis diseños", "cosas parecidas a las mías"), ("copian sus modelos", "hacen modelos parecidos a los suyos"), ("¿Copiar?", "¿Parecidos?")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, embroidery artisans from a mountain village of Oaxaca, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{TOMASA_SANABRIA}", "an old Mexican embroiderer"), ("@{YARETZI_SANABRIA}", "a Mexican woman"),
         ("@{ROMINA_ARRIOLA}", "an elegant Mexican shop owner"), ("@{CRESCENCIA_LOPEZ}", "a Mexican village woman"),
         ("@{OFELIA_FERIA2}", "a Mexican fair organizer"),
         (" @{LOC_PATIOTOMASA}", ""), (" @{LOC_BOUTIQUEROM}", ""), (" @{LOC_FERIACARPA}", ""), (" @{LOC_CALLEFERIA}", "")]
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
