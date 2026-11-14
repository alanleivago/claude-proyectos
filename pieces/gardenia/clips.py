"""Genera los clips de gardenia PARTE 1 (La Boda de las Gardenias, video 23, historia ORIGINAL no navideña, VISTA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2 / nochebuena c18 / regreso-20: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c29 / chocolate-rancho-p2 c34 / medalla-mezcal-p2 c01 / posada c22 / regreso-20 c28 / tele-nueva: frase repetida al final -> silencio tras la última palabra
# QA regreso-20 c10/c12: se perdía la 2ª frase -> el diálogo va completo y cada clip tiene margen (8 s para dos frases)
END = "After the last word the person stays silent until the end of the shot."
# QA camionero v1 / posada / fierro-herradura / intercambio: "looking at X off-screen" pone a X (o a un doble) en el borde -> TODOS los planos son de una sola persona
# (ONE + ALONE) con la mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder (QA padre-veladoras-p2, canasta c12).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Patio de tarde (c01-c12, r1): Rosaura a la IZQUIERDA junto a la mesa de madera con su pastel; Abel IZQUIERDA a su lado; Chona IZQUIERDA en la puerta verde;
#     Leticia a la DERECHA junto al zaguán de reja.
#   Patio de tarde, la gardenia (c13-c16, r2): Rosaura IZQUIERDA; Gilberto DERECHA en el zaguán.
#   Patio al anochecer (c17-c19): Rosaura IZQUIERDA; Abel DERECHA.
#   Patio de noche, un solo foco (c20-c26, r3): Rosaura IZQUIERDA junto a la mesa; Gilberto y Chona DERECHA (llegan por el zaguán).
#   Puerta del salón de noche (c27-c32, r4): Leticia IZQUIERDA en la banqueta; Gilberto y luego Rosaura DERECHA en la puerta abierta.
#   Gancho (c33 Leticia sola en la banqueta, r5 Abel solo en el pasillo de adentro) y CTA (c34): Rosaura sola en la puerta del salón.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): nada religioso, sin adornos, sin letreros.
PAT = ("in the courtyard @{LOC_PATIOALCANTARA} of a humble Mexican vecindad in the late afternoon, cement floor, faded turquoise and ochre walls, "
       "two cement washing sinks along the back wall, a few potted red geraniums, one plain wooden table, soft natural daylight; "
       "no readable text, no signs; no extras, nobody else in the courtyard besides the person described")
PATD = PAT.replace("in the late afternoon", "at dusk").replace("soft natural daylight", "soft blue dusk light")
PATN = PAT.replace("in the late afternoon", "at night").replace("soft natural daylight", "one single bare light bulb hanging over the wooden table, a warm pool of light, dark around")
PUE = ("in front of the event hall @{LOC_PUERTAGARDENIAS} at night, a tall dark carved wooden double door in a pale cantera stone frame, two iron wall lanterns glowing, "
       "an empty cobblestone sidewalk; no readable text, no signs, no letters above the door; no extras, nobody else on the street besides the person described")
PUEO = PUE.replace("a tall dark carved wooden double door", "a tall dark carved wooden double door standing open, warm golden light coming from inside")
HALL = ("inside the entrance corridor of an elegant event hall at night, pale cantera stone walls, two warm wall lamps, an empty corridor; "
        "no readable text, no signs; no extras, nobody else in the corridor")
# Anclas de identidad y ropa (vestuario fijo, toda la historia pasa el mismo día). NADIE lleva sombrero, velo ni lentes (QA reten/medalla/padre-veladoras: sombreros dobles
# o flotando; reten-sierra-p2: lentes que entran y salen). Manos abiertas, nadie señala con el dedo. Sin uniformes, sin gafetes ni letras en la ropa.
ROS = ("@{ROSAURA_ALCANTARA} (32-year-old Mexican mestizo woman, brown skin, sweet honest face, black hair in one low bun tied with a thin white ribbon, no hat, no veil, no glasses, "
       "simple long white cotton wedding dress with short sleeves and a plain round neckline, small silver stud earrings, her hands open)")
LET = ("@{LETICIA_ALCANTARA} (38-year-old Mexican woman, light brown skin, elegant proud face, sleek straight black hair in a high polished ponytail, no hat, no glasses, "
       "long fitted royal blue satin evening dress with long sleeves, one pearl necklace, small pearl earrings, her hands kept low, she never points a finger at anyone)")
ABE = ("@{ABEL_SANDOVAL} (35-year-old Mexican man, brown skin, short wavy black hair, completely clean-shaven face, no hat, no glasses, "
       "dark grey suit jacket, white shirt, thin dark grey tie, his hands open)")
CHO = ("@{CHONA_BECERRA} (70-year-old Mexican woman, brown skin, kind round face, short curly grey hair, no hat, no glasses, "
       "maroon knit cardigan over a navy blue floral dress, small gold earrings, her hands open)")
GIL = ("@{GILBERTO_ARRIAGA} (66-year-old Mexican man, light brown skin, calm dignified face, thick white hair combed back, short neat white moustache, no beard, no hat, no glasses, "
       "long camel brown wool overcoat over a white shirt, no tie, one thin gold wedding ring, his hands open)")
# QA padre-veladoras-p2 / medalla-mezcal-p2 / encendedor c11 / tele-nueva c19 / sazon-concha (dos cucharas) / chocolate-rancho-p2 (sobre lacrado que aparece): utilería duplicada o
# inventada -> cada objeto, uno solo, simple y nombrado; ninguna carpeta, sobre ni papel en la historia.
CAKE = "one small homemade one-tier white cake on a plain white plate on the wooden table, no figurines, no candles, no writing on it"
GARD = "one single white gardenia flower, no other flowers in her hands"
MOLE = "one single round clay pot held with both hands"
PHONE = "one black smartphone held to her ear, its screen turned away from the camera"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / regreso-20 c06 / camionero c16 / regreso-chicago-p2: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

CLIPS = [
 # 1. Gancho / humillación (patio de tarde): Leticia habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT by the iron gate, a proud cold half smile, chin up", "LEFT",
     NODOUBLE("woman in a blue satin dress")), "proud, mocking, slow")),
 ("c02", 6, talk("c02", "Rosaura", one(f"Close-up of {ROS} {PAT}, standing on the LEFT by the wooden table, surprised and hurt, her hands open in front of her", "RIGHT",
     NODOUBLE("woman in a white dress")), "surprised, hurt, quiet")),
 ("c03", 8, talk("c03", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT by the iron gate, a satisfied smile, she tilts her head", "LEFT"),
     "proud, condescending, slow")),
 ("c04", 8, talk("c04", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT, she looks the other woman up and down slowly, a cold smile", "LEFT"),
     "mocking, cold, sweet")),
 ("c05", 8, talk("c05", "Rosaura", one(f"Close-up of {ROS} {PAT}, standing on the LEFT, her eyes shine, dignified, she lifts her chin", "RIGHT"),
     "hurt, dignified, controlled")),
 ("c06", 6, talk("c06", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT, she raises her eyebrows, a cold smile", "LEFT",
     NODOUBLE("woman in a blue satin dress")), "cold, proud, final")),
 ("c07", 6, talk("c07", "Abel", one(f"Close-up of {ABE} {PAT}, standing on the LEFT beside the wooden table, serious, one open hand raised a little", "RIGHT"),
     "firm, calm, protective")),
 ("c08", 8, talk("c08", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT, a small knowing smile, she lowers her voice", "LEFT"),
     "cold, quiet, knowing")),
 ("c09", 8, talk("c09", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT next to the end of the wooden table, she glances down at {CAKE}, a mocking smile", "LEFT",
     "the cake stays untouched on the table the whole time"), "mocking, sweet, condescending")),
 ("c10", 8, talk("c10", "Chona", one(f"Close-up of {CHO} {PAT}, standing on the LEFT at a green wooden door, brave and kind, her hands open low", "RIGHT"),
     "brave, kind, firm")),
 ("c11", 8, talk("c11", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT by the iron gate, she turns her head slowly, serious and cold", "LEFT",
     NODOUBLE("woman in a blue satin dress")), "cold, serious, slow")),
 ("c12", 8, talk("c12", "Leticia", one(f"Close-up of {LET} {PAT}, standing on the RIGHT by the iron gate, a sweet poisonous smile, she adjusts her pearl necklace", "LEFT"),
     "sweet, mocking, condescending")),
 ("r1", 6, one(f"Close-up of {ROS} {PAT}, standing on the LEFT by the wooden table, in silence, her eyes shine, she lowers her eyes and breathes slowly", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. La siembra: la gardenia de los sábados (Gilberto todavía no dice quién es)
 ("c13", 6, talk("c13", "Gilberto", one(f"Close-up of {GIL} {PAT}, standing on the RIGHT at the iron gate, a gentle smile that turns worried", "LEFT"),
     "gentle, warm, worried")),
 ("c14", 8, talk("c14", "Rosaura", one(f"Close-up of {ROS} {PAT}, standing on the LEFT, a sad brave smile, she holds out {GARD} on her open palm", "RIGHT"),
     "sad, sweet, brave")),
 ("c15", 8, talk("c15", "Gilberto", one(f"Close-up of {GIL} {PAT}, standing on the RIGHT, he holds {GARD} in one hand close to his chest, moved, then serious", "LEFT"),
     "moved, low, serious")),
 ("c16", 6, talk("c16", "Rosaura", one(f"Close-up of {ROS} {PAT}, standing on the LEFT, she shakes her head softly, a small sad smile", "RIGHT"),
     "sad, kind, quiet")),
 ("r2", 6, one(f"Close-up of {GIL} {PAT}, standing on the RIGHT at the iron gate, in silence, he looks down at {GARD} in his hand, then lifts his eyes, serious and decided", "LEFT") + " Slow push-in. No dialogue."),
 # 3. El bajón (patio al anochecer)
 ("c17", 6, talk("c17", "Abel", one(f"Close-up of {ABE} {PATD}, standing on the RIGHT, he avoids her eyes, uneasy, his hands open low", "LEFT"),
     "soft, uneasy, quiet")),
 ("c18", 8, talk("c18", "Rosaura", one(f"Close-up of {ROS} {PATD}, standing on the LEFT by the wooden table, firm and dignified, her eyes shine", "RIGHT",
     NODOUBLE("woman in a white dress")), "firm, dignified, sad")),
 ("c19", 8, talk("c19", "Rosaura", one(f"Close-up of {ROS} {PATD}, standing on the LEFT, she opens her hands at her sides and looks around the empty courtyard, sad", "RIGHT"),
     "sad, quiet, broken")),
 # 4. El giro de poder (patio de noche, un solo foco): llega Gilberto
 # QA v1 c20: entraba caminando desde el borde DER., figura oscura en el borde IZQ. y subtítulos quemados de las dos frases -> quieto desde el frame 0 + NODOUBLE + franja inferior limpia
 ("c20", 6, talk("c20", "Gilberto", one(f"Close-up of {GIL} {PATN}, standing still on the RIGHT just inside the iron gate, already centered in the frame and close to the camera from the very first frame, he does not walk, a warm firm smile", "LEFT",
     NODOUBLE("person") + "; no subtitles at any moment, not even for his short question; the lower half of the frame shows only his camel coat and the dark courtyard floor"),
     "warm, firm, calm")),
 ("c21", 6, talk("c21", "Rosaura", one(f"Close-up of {ROS} {PATN}, standing on the LEFT by the wooden table, surprised, her hand on her chest", "RIGHT"),
     "surprised, soft, moved")),
 ("c22", 8, talk("c22", "Gilberto", one(f"Close-up of {GIL} {PATN}, standing on the RIGHT, calm and proud, he nods slowly", "LEFT"),
     "calm, proud, warm")),
 ("c23", 8, talk("c23", "Gilberto", one(f"Close-up of {GIL} {PATN}, standing on the RIGHT, firm, a small smile", "LEFT"),
     "firm, warm, final")),
 ("c24", 6, talk("c24", "Rosaura", one(f"Close-up of {ROS} {PATN}, standing on the LEFT, worried, she shakes her head a little", "RIGHT"),
     "worried, soft, unsure")),
 ("c25", 8, talk("c25", "Gilberto", one(f"Close-up of {GIL} {PATN}, standing on the RIGHT, serious and calm, he shakes his head once", "LEFT"),
     "serious, calm, firm")),
 ("c26", 8, talk("c26", "Chona", one(f"Close-up of {CHO} {PATN}, standing on the RIGHT at the iron gate, a big warm smile, she holds {MOLE} against her chest", "LEFT",
     NODOUBLE("grey-haired woman")), "warm, happy, proud")),
 ("r3", 6, one(f"Close-up of {ROS} {PATN}, standing on the LEFT by the wooden table, in silence, her eyes shine, a trembling grateful smile, both hands on her chest", "RIGHT") + " Slow push-in. No dialogue."),
 # 5. El payoff (puerta del salón de noche): a Leticia no la dejan entrar
 ("c27", 8, talk("c27", "Leticia", one(f"Close-up of {LET} {PUE}, standing on the LEFT on the sidewalk, confused and impatient, her hands open low", "RIGHT",
     NODOUBLE("woman in a blue satin dress")), "impatient, surprised, proud")),
 ("c28", 6, talk("c28", "Gilberto", one(f"Close-up of {GIL} {PUEO}, standing on the RIGHT in the open doorway, calm, polite and firm", "LEFT"),
     "calm, polite, firm")),
 ("c29", 8, talk("c29", "Leticia", one(f"Close-up of {LET} {PUE}, standing on the LEFT on the sidewalk, upset, she lifts her chin, hands open low", "RIGHT"),
     "upset, proud, defensive")),
 ("c30", 6, talk("c30", "Gilberto", one(f"Close-up of {GIL} {PUEO}, standing on the RIGHT in the open doorway, serious, he looks at her calmly", "LEFT"),
     "serious, calm, final")),
 ("c31", 6, talk("c31", "Leticia", one(f"Close-up of {LET} {PUE}, standing on the LEFT on the sidewalk, her eyes open in surprise, her proud smile disappears", "RIGHT"),
     "shocked, quiet, disbelieving")),
 ("c32", 8, talk("c32", "Rosaura", one(f"Close-up of {ROS} {PUEO}, standing on the RIGHT in the open doorway, calm and radiant, a small dignified smile", "LEFT",
     NODOUBLE("woman in a white dress")), "calm, dignified, a little ironic")),
 ("r4", 6, one(f"Close-up of {LET} {PUE}, standing on the LEFT on the sidewalk, in silence, humiliated, she lowers her eyes and breathes", "RIGHT") + " Slow push-in. No dialogue."),
 # 6. Gancho para la Parte 2: Leticia sola en la banqueta llama a Abel; Abel adentro, solo, con el celular
 ("c33", 6, talk("c33", "Leticia", one(f"Close-up of {LET} {PUE}, standing alone on the LEFT on the dark sidewalk, {PHONE}, a cold quiet smile returns to her face", "RIGHT"),
     "cold, quiet, menacing")),
 ("r5", 6, f"Medium close-up of {ABE} {HALL}, standing alone, he holds one black smartphone to his ear with its screen turned away from the camera, he listens, "
           f"his smile slowly disappears, he lowers the phone and glances over his shoulder, uneasy; {SOLO}; he is the only person in the whole shot, already in place from the very first frame; "
           f"no hands or arms entering from the edges. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Rosaura en la puerta del salón, a cámara
 ("c34", 10, talk("c34", "Rosaura", f"Medium close-up of {ROS} {PUEO}, alone in the open doorway, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she tilts her head, raises her eyebrows, touches the ribbon in her hair, nods and smiles. "
     f"Nobody else on the street or in the doorway.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"), ("commanding", "firm"),
        ("ashamed", "humble"), ("humiliated", "quiet"), ("stammering", "quiet"), ("forced", "small"), ("shocked", "surprised"), ("broken", "quiet"),
        ("eyes wide", "eyes open"), ("eyes open in surprise", "eyes open"), ("condescending", "polite"), ("dismissive", "calm"), ("poisonous", "polite"),
        ("swallows", "breathes"), ("hurt", "sad"), ("dark sidewalk", "quiet sidewalk"), ("dark around", "soft shadows around"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("uneasy", "quiet"),
        ("¡", ""), ("!", "."), ("Mejor quítatelo antes de que alguien te vea", "Mejor cámbiate antes de que alguien te vea"),
        ("se olvida de trabajar en mis tiendas", "ya no es bienvenido en mis tiendas"), ("La que le quitó la boda a su propia hermana", "La que no quiso ver casada a su propia hermana"),
        ("haz lo que acordamos", "ya sabes qué hacer")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, humble Mexican neighborhood on a wedding day, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family wedding drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{ROSAURA_ALCANTARA}", "a Mexican bride"), ("@{LETICIA_ALCANTARA}", "an elegant Mexican woman"),
         ("@{ABEL_SANDOVAL}", "a Mexican man"), ("@{CHONA_BECERRA}", "a Mexican grandmother"),
         ("@{GILBERTO_ARRIAGA}", "a distinguished Mexican man"), (" @{LOC_PATIOALCANTARA}", ""), (" @{LOC_PUERTAGARDENIAS}", "")]
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
