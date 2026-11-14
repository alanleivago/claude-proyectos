"""Genera los clips de bascula-limon PARTE 1 (La Báscula Arreglada, historia propia inspirada en la ref 7702205802534194435 de @relatos.de.vida.9, SINMARCA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
#   Acopio, escenas 1 y 4 (c01-c05, r1, c13-c19, r2): Bulmaro a la DERECHA junto a la báscula; Fermín y Daniela a la IZQUIERDA.
#   Huerta, tarde (c06-c12, c21-c23, r3): Fermín a la IZQUIERDA sentado en una caja de limones; Daniela y Chalo a la DERECHA.
#   Acopio, c20: Bulmaro solo al teléfono, mira a la IZQUIERDA.
#   Porche de noche (c24-c30): Fermín a la IZQUIERDA sentado en la banca; Daniela a la DERECHA.
#   r4: Bulmaro solo en el acopio de noche. CTA (c31): Fermín solo en el porche de noche, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin números, sin marcas, sin adornos.
# La báscula es MECÁNICA (plataforma con brazo y pesa corrediza): sin pantalla ni números que Omni pueda escribir.
ACO = ("in the lime collection shed @{LOC_ACOPIOLIMON} of a farming town in Michoacán in the morning: concrete floor, corrugated metal roof, stacks of green plastic crates full of green limes, "
       "one old grey mechanical platform scale with a metal beam and a sliding weight, no digital display; hot bright daylight from the open side; "
       "no readable text, no numbers, no signs, no logos; no extras, nobody else in the shed besides the person described")
ACON = ACO.replace("in the morning", "at night").replace("hot bright daylight from the open side", "one bare bulb light, deep dark shadows")
HUE = ("in the lime orchard @{LOC_HUERTALIMON} in the late afternoon: rows of green lime trees, a few green plastic crates of limes under a tree, dry dirt ground; "
       "warm golden afternoon light; no readable text, no signs, no logos; "
       "no extras, nobody else in the orchard besides the person described")
POR = ("on the porch @{LOC_PORCHEZAVALA} of a humble village house at night: a plain whitewashed wall, one wooden bench, a few green plastic crates of limes stacked by the wall, "
       "one bare warm bulb above; warm bulb light with soft dark shadows; no readable text, no signs, no logos; "
       "no extras, nobody else on the porch besides the person described")
# Anclas de identidad y ropa (atuendos de la ref con otros colores: el campesino de camisa blanca -> camisa azul claro y sombrero de palma gastado;
# la hija -> contadora adulta de blusa terracota y libreta café; el acopiador -> guayabera crema con cadena de oro).
# Solo Fermín lleva sombrero (de palma); nadie más lleva sombrero, gorra ni lentes. Manos abiertas, nadie señala con el dedo. Sin uniformes, gafetes ni letras en la ropa.
# Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
FER = ("@{FERMIN_ZAVALA} (66-year-old Mexican farmer, tan weathered skin, deep wrinkles, white mustache, a worn palm leaf sombrero, no glasses, "
       "light blue long-sleeve work shirt, jeans with a brown leather belt, rough hands kept low)")
DAN = ("@{DANIELA_ZAVALA} (31-year-old Mexican woman, clearly an adult, brown skin, smart determined face, shoulder-length straight black hair, no hat, no glasses, "
       "terracotta orange blouse, beige trousers, small silver earrings, her hands kept low)")
BUL = ("@{BULMARO_PADILLA} (50-year-old Mexican man, light brown skin, heavy-set, smug fleshy face, slicked-back black hair, thick black mustache, no hat, no glasses, "
       "cream guayabera shirt, thin gold chain, dark trousers, his hands kept low, he never points a finger at anyone)")
CHA = ("@{CHALO_MORENO} (63-year-old Mexican farmer, brown skin, worried friendly face, bald head with short grey stubble, grey stubble beard, no hat, no glasses, "
       "olive green work shirt, dusty jeans, his hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
NOTE = "one small brown notebook held open in her LEFT hand"
SACK = "one plain grey paper sack of cement with no printing on it"
CALL = "one black smartphone held to his ear with his RIGHT hand"
PHONE = "one black smartphone held low in her RIGHT hand, its screen turned away from the camera"
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
 # 1. Gancho / humillación (acopio, mañana): Bulmaro habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing on the RIGHT beside the mechanical scale, a smug bored smile", "LEFT",
     NODOUBLE("man in a cream guayabera")), "smug, bored, condescending")),
 ("c02", 6, talk("c02", "Fermín", one(f"Close-up of {FER} {ACO}, standing on the LEFT, humble and hurt, calm", "RIGHT",
     NODOUBLE("man in a palm leaf sombrero")), "humble, hurt, calm")),
 ("c03", 6, talk("c03", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing on the RIGHT beside the mechanical scale, he shrugs, dismissive, "
     f"his face and eyes turned toward the LEFT side of the frame the whole time, never toward the right", "LEFT", NODOUBLE("man in a cream guayabera")),
     "dismissive, cold, bored")),
 ("c04", 6, talk("c04", "Daniela", one(f"Close-up of {DAN} {ACO}, standing on the LEFT, polite but suspicious, one eyebrow raised", "RIGHT",
     NODOUBLE("woman in a terracotta blouse")), "polite, suspicious, calm")),
 ("c05", 6, talk("c05", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing on the RIGHT, a mocking smile, chin up", "LEFT"),
     "mocking, superior, cold")),
 ("r1", 6, one(f"Close-up of {FER} {ACO}, standing on the LEFT, in silence, he lowers his eyes and touches the brim of his palm leaf sombrero, humiliated", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. La cuenta (huerta, tarde): Daniela con su libreta
 ("c06", 8, talk("c06", "Daniela", one(f"Close-up of {DAN} {HUE}, standing on the RIGHT, {NOTE}, she looks up from the notebook, serious", "LEFT",
     NODOUBLE("woman in a terracotta blouse")), "serious, sure, quiet")),
 ("c07", 6, talk("c07", "Fermín", one(f"Close-up of {FER} {HUE}, sitting on the LEFT on a green crate of limes, tired, he shrugs a little", "RIGHT",
     NODOUBLE("man in a palm leaf sombrero")), "tired, resigned, soft")),
 ("c08", 6, talk("c08", "Daniela", one(f"Close-up of {DAN} {HUE}, standing on the RIGHT, {NOTE}, indignant and firm", "LEFT"),
     "indignant, firm, sure")),
 ("c09", 8, talk("c09", "Fermín", one(f"Close-up of {FER} {HUE}, sitting on the LEFT on a green crate of limes, worried, his eyes shine", "RIGHT"),
     "worried, afraid, quiet")),
 # 3. La decisión (huerta, tarde): entra la cama cálida
 ("c10", 6, talk("c10", "Chalo", one(f"Close-up of {CHA} {HUE}, standing on the RIGHT, worried, he rubs the back of his neck", "LEFT",
     NODOUBLE("man in an olive green shirt")), "worried, frank, quiet")),
 ("c11", 8, talk("c11", "Daniela", one(f"Close-up of {DAN} {HUE}, standing on the RIGHT, decided, a small brave smile", "LEFT"),
     "decided, brave, warm")),
 ("c12", 6, talk("c12", "Fermín", one(f"Close-up of {FER} {HUE}, sitting on the LEFT on a green crate of limes, a proud tender smile, he nods", "RIGHT"),
     "proud, tender, warm")),
 # 4. La prueba del bulto (acopio, mañana): vuelve el suspenso
 ("c13", 8, talk("c13", "Daniela", one(f"Close-up of {DAN} {ACO}, standing on the LEFT, {SACK} resting on her shoulder, polite and firm", "RIGHT",
     NODOUBLE("woman in a terracotta blouse")), "polite, firm, calm")),
 ("c14", 6, talk("c14", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing on the RIGHT beside the mechanical scale, uneasy, a forced smile", "LEFT",
     NODOUBLE("man in a cream guayabera")), "uneasy, dismissive, cold")),
 ("c15", 6, talk("c15", "Daniela", one(f"Close-up of {DAN} {ACO}, standing on the LEFT, calm and firm, a small smile", "RIGHT"),
     "calm, firm, polite")),
 ("r2", 6, f"Close-up insert {ACO}: {SACK} lies on the platform of the old mechanical scale and the metal beam slowly rises and settles; only the scale and the sack in frame, "
     f"no face, no hands, no numbers, no display, {SOLO}. Slow push-in. No dialogue. No text."),
 ("c16", 6, talk("c16", "Daniela", one(f"Close-up of {DAN} {ACO}, standing on the LEFT, she looks up from the scale, serious and sure", "RIGHT"),
     "serious, sure, cutting")),
 ("c17", 6, talk("c17", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing on the RIGHT beside the mechanical scale, his smile gone, cold and annoyed", "LEFT"),
     "cold, annoyed, firm")),
 ("c18", 6, talk("c18", "Fermín", one(f"Close-up of {FER} {ACO}, standing on the LEFT, dignified, his eyes shine, his jaw tight", "RIGHT",
     NODOUBLE("man in a palm leaf sombrero")), "dignified, hurt, firm")),
 ("c19", 6, talk("c19", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing on the RIGHT, cold and menacing, he smooths his guayabera", "LEFT",
     NODOUBLE("man in a cream guayabera")), "cold, menacing, calm")),
 # 5. El villano mueve ficha (acopio): Bulmaro solo al teléfono
 ("c20", 8, talk("c20", "Bulmaro", one(f"Close-up of {BUL} {ACO}, standing alone among the crates, {CALL}, a calm cold smile", "LEFT"),
     "calm, cold, calculating")),
 # 6. La consecuencia (huerta, tarde)
 ("c21", 8, talk("c21", "Chalo", one(f"Close-up of {CHA} {HUE}, standing on the RIGHT, sad and ashamed, he looks down", "LEFT",
     NODOUBLE("man in an olive green shirt")), "sad, ashamed, quiet")),
 ("c22", 6, talk("c22", "Fermín", one(f"Close-up of {FER} {HUE}, sitting on the LEFT on a green crate of limes, calm and sad, he nods slowly", "RIGHT"),
     "calm, sad, kind")),
 ("c23", 6, talk("c23", "Daniela", one(f"Close-up of {DAN} {HUE}, standing on the RIGHT, worried, she looks at the crates", "LEFT"),
     "worried, quiet, firm")),
 ("r3", 6, one(f"Close-up of {FER} {HUE}, sitting on the LEFT on a green crate of limes, in silence, he picks up one green lime from a crate and turns it in his rough fingers, sad", "RIGHT") + " Slow push-in. No dialogue."),
 # 7. Punto más bajo (porche de noche)
 ("c24", 6, talk("c24", "Fermín", one(f"Close-up of {FER} {POR}, sitting on the LEFT on the wooden bench, tired and defeated, his eyes shine", "RIGHT",
     NODOUBLE("man in a palm leaf sombrero")), "tired, defeated, quiet")),
 ("c25", 6, talk("c25", "Daniela", one(f"Close-up of {DAN} {POR}, standing on the RIGHT, tender and firm", "LEFT",
     NODOUBLE("woman in a terracotta blouse")), "tender, firm, warm")),
 ("c26", 6, talk("c26", "Fermín", one(f"Close-up of {FER} {POR}, sitting on the LEFT on the wooden bench, he shakes his head slowly", "RIGHT"),
     "sad, tired, soft")),
 # 8. Gancho para la Parte 2
 ("c27", 8, talk("c27", "Daniela", one(f"Close-up of {DAN} {POR}, standing on the RIGHT, {PHONE}, a slow knowing smile", "LEFT"),
     "knowing, calm, a little playful")),
 ("c28", 8, talk("c28", "Daniela", one(f"Close-up of {DAN} {POR}, standing on the RIGHT, determined, she speaks low", "LEFT"),
     "determined, quiet, proud")),
 ("c29", 6, talk("c29", "Fermín", one(f"Close-up of {FER} {POR}, sitting on the LEFT on the wooden bench, surprised, he raises his eyebrows", "RIGHT"),
     "surprised, curious, soft")),
 ("c30", 6, talk("c30", "Daniela", one(f"Close-up of {DAN} {POR}, standing on the RIGHT, a warm proud smile", "LEFT"),
     "warm, proud, quiet")),
 ("r4", 6, one(f"Close-up of {BUL} {ACON}, standing alone among the crates, in silence, he looks at the mechanical scale with a smug satisfied smile, unaware", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Fermín en el porche de noche, a cámara
 ("c31", 10, talk("c31", "Fermín", f"Medium close-up of {FER} {POR}, alone, sitting on the wooden bench, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; while he speaks he touches and adjusts the brim of his palm leaf sombrero, tilts his head, raises his eyebrows, nods and smiles. "
     f"Nobody else on the porch.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("humiliated", "quiet"),
        ("defeated", "quiet"), ("afraid", "worried"), ("ashamed", "sad"), ("cutting", "clear"), ("forced smile", "small smile"), ("fleshy", "round"),
        ("suspicious", "curious"), ("hurt", "serious"), ("uneasy", "quiet"), ("superior", "proud"), ("dismissive", "calm"), ("bored", "calm"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("cold", "serious"),
        ("¡", ""), ("!", "."), ("me pesó chueco", "me pesó mal"), ("El que robaba era él.", "El que hacía trampa era él."),
        ("me veta", "me deja fuera"), ("conmigo ya no trabaja", "ya no trabaja conmigo")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, lime farmers in a farming town of Michoacán, warm natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{FERMIN_ZAVALA}", "an old Mexican lime farmer"), ("@{DANIELA_ZAVALA}", "a Mexican woman"),
         ("@{BULMARO_PADILLA}", "a Mexican lime buyer"), ("@{CHALO_MORENO}", "a Mexican farmer"),
         (" @{LOC_ACOPIOLIMON}", ""), (" @{LOC_HUERTALIMON}", ""), (" @{LOC_PORCHEZAVALA}", "")]

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
