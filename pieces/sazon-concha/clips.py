"""Genera los clips de sazon-concha PARTE 1 (El Sazón de Doña Concha, video 21, historia ORIGINAL, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA agua-hacienda-p2 c29 / chocolate-rancho-p2 c34 / medalla-mezcal-p2 c01 / posada c22: frase repetida al final -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA camionero v1 / posada / fierro-herradura: "looking at X off-screen" pone a X (o a un doble) en el borde -> TODOS los planos son de una sola persona
# (ONE + ALONE) con la mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder (QA padre-veladoras-p2, canasta c12).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Cocina (c01-c07, r1, c25-c27, c31): Concha y su cazuela a la IZQUIERDA junto a la estufa; Maximiliano y Darío a la DERECHA; Toño al CENTRO junto al fregadero.
#     En el payoff (c25-c27) Victoria está a la DERECHA.
#   Callejón (c08-c11 de tarde; c28-c30, r4 de noche): Concha IZQUIERDA y Toño DERECHA; de noche Maximiliano IZQUIERDA y Darío DERECHA.
#   Comedor (c12-c24, i1, r2, r3): Victoria sentada al CENTRO en la mesa; Maximiliano y Darío de pie a la DERECHA; Concha y Toño a la IZQUIERDA, junto a la puerta de la cocina.
COC = ("in the big traditional kitchen @{LOC_COCINACASONA} of an old Mexican restaurant house, blue and white talavera tiles, a long tiled stove with clay pots, "
       "copper pots hanging high on the wall, warm afternoon light from a small window; no knives anywhere, no signs, no readable text; no extras, nobody else in the kitchen besides the people described")
CAL = ("in the narrow back alley @{LOC_CALLEJONCASONA} behind the restaurant house, old ochre plastered walls, one green wooden back door, a few empty wooden crates, "
       "soft late afternoon light; no signs, no graffiti, no readable text; no extras, nobody else in the alley")
CALN = CAL.replace("soft late afternoon light", "night, one warm wall lamp above the door, deep shadows")
COM = ("in the elegant dining room @{LOC_COMEDORCASONA} of the old Mexican restaurant house, high arched walls painted deep terracotta, one long table with a white tablecloth, "
       "dark carved wooden chairs, warm hanging lamps, potted palms; no paintings with text, no menus, no readable text; no extras, no diners, nobody else in the room")
# Anclas de identidad y ropa (vestuario fijo). NADIE lleva sombrero ni lentes (QA reten/medalla P2: sombreros dobles; reten-sierra-p2 c21: lentes que entran y salen).
# Sin filipinas ni gorros de cocinero (pueden leerse como uniforme y el gorro es un sombrero). Manos abiertas, nadie señala con el dedo.
CON = ("@{CONCEPCION_MOLERA} (58-year-old Mexican mestizo woman, brown skin, kind strong face, black hair with grey strands in a low bun, no hat, no glasses, "
       "white cotton blouse with small red embroidered flowers around the neckline, one plain dark green apron, small silver stud earrings, her hands open)")
MAX = ("@{MAXIMILIANO_GERENTE} (38-year-old Mexican mestizo man, light brown skin, black hair combed back with gel, completely clean-shaven face, no hat, no glasses, "
       "dark burgundy blazer over a black shirt with an open collar and no tie, one silver wristwatch, his hands open and kept low, he never points a finger at anyone)")
DAR = ("@{DARIO_COCINERO} (32-year-old Mexican mestizo man, brown skin, short black hair with shaved sides, short neat black beard, no hat, no glasses, "
       "plain black long-sleeve shirt, one plain grey canvas apron, his hands empty)")
TON = ("@{ANTONIO_LAVALOZA} (45-year-old Mexican mestizo man, brown skin, round friendly face, short black hair with some grey, thick black moustache, no hat, no glasses, "
       "faded mustard-yellow t-shirt under one long plain white rubber apron, his hands open)")
VIC = ("@{VICTORIA_LAZCANO} (72-year-old Mexican mestizo woman, light brown skin, short styled silver hair, elegant calm face, no hat, no glasses, "
       "long-sleeve black dress, one plum-colored wool shawl over her shoulders, small pearl earrings, her hands open)")
# QA padre-veladoras-p2 / medalla-mezcal-p2 / encendedor c11 / regreso-chicago-p2 c11: utilería duplicada o deformada -> cada objeto, uno solo y simple
POT = ("one single large round clay cazuela @{PROP_CAZUELAMOLE}, glazed dark brown with a simple rim, full of thick dark mole sauce; no second pot of mole anywhere")
# QA P1 i1: quedaba una cuchara en la mesa y la mano levantaba otra -> la única cuchara es la de la mano, nada de cubiertos en la mesa
PLATE = ("one single white plate with dark mole sauce over a piece of chicken, sprinkled with sesame seeds; no second plate, "
         "no spoon, fork or any cutlery next to it")
APRON = "she holds her folded dark green apron in one hand"
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
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

CLIPS = [
 # 1. Gancho / humillación en la cocina: Maximiliano habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Maximiliano", one(f"Close-up of {MAX} {COC}, standing on the RIGHT, a proud half smile, he wrinkles his nose, one open hand turned up", "LEFT",
     NODOUBLE("man in a burgundy blazer")), "proud, mocking, slow")),
 ("c02", 8, talk("c02", "Concha", one(f"Close-up of {CON} {COC}, standing on the LEFT beside the stove with {POT} beside her, hurt and dignified, one open hand on her chest", "RIGHT"),
     "hurt, firm, dignified")),
 ("c03", 8, talk("c03", "Darío", one(f"Close-up of {DAR} {COC}, standing on the RIGHT, sure of himself, a polite cold smile", "LEFT",
     NODOUBLE("man in a black shirt")), "sure, polite, a little proud")),
 ("c04", 8, talk("c04", "Maximiliano", one(f"Close-up of {MAX} {COC}, standing on the RIGHT, satisfied, he nods and opens one hand low toward the back door", "LEFT"),
     "satisfied, mocking, commanding")),
 ("c05", 8, talk("c05", "Concha", one(f"Close-up of {CON} {COC}, standing on the LEFT, eyes shining, she lifts her chin", "RIGHT"),
     "hurt, firm, controlled")),
 ("c06", 8, talk("c06", "Maximiliano", one(f"Close-up of {MAX} {COC}, standing on the RIGHT, a cold smile, he shakes his head slowly", "LEFT"),
     "cold, proud, mocking")),
 ("c07", 6, talk("c07", "Concha", f"Medium close-up of {CON} {COC}, standing on the LEFT, eyes shining, she unties her apron and folds it slowly, {POT} on the stove beside her; "
     f"{gaze('RIGHT')}; she is the only person in the whole shot, already in place from the very first frame; no hands or arms entering from the edges.",
     "quiet, hurt, then firm")),
 ("r1", 6, one(f"Close-up of {TON} {COC}, standing in the CENTER by the sink, in silence, uneasy, he lowers his eyes and swallows", "LEFT") + " Slow push-in. No dialogue."),
 # 2. Callejón de atrás (tarde): Toño la alcanza (ya en su lugar desde el frame 0, nunca entra caminando)
 ("c08", 8, talk("c08", "Toño", one(f"Close-up of {TON} {CAL}, standing on the RIGHT by the green back door, worried, he lowers his voice, one open hand raised a little", "LEFT"),
     "worried, low, kind")),
 # QA P1 c09: traía un rebozo a cuadros en la mano y falda verde (se leía como el mandil puesto) + doble de Concha en el borde DER.
 ("c09", 8, talk("c09", "Concha", one(f"Close-up of {CON} {CAL}, standing on the LEFT against the ochre wall, {APRON}, sad and surprised", "RIGHT",
     NODOUBLE("woman in a white embroidered blouse") + "; she no longer wears the apron, her long dark grey skirt is visible; the only cloth in her hand is "
     "her own plain dark green apron, folded, the same green as in her reference; no shawl, no rebozo, no plaid or striped cloth"), "sad, surprised, quiet")),
 ("c10", 8, talk("c10", "Toño", one(f"Close-up of {TON} {CAL}, standing on the RIGHT, serious, he glances at the back door, then back", "LEFT"),
     "serious, low, urgent")),
 ("c11", 8, talk("c11", "Concha", one(f"Close-up of {CON} {CAL}, standing on the LEFT, {APRON}, her face changes from surprise to calm decision, she lifts her chin", "RIGHT"),
     "surprised, then firm and decided")),
 # 3. Comedor: Victoria prueba el mole (Victoria CENTRO sentada; Maximiliano y Darío DER.; Concha y Toño IZQ.)
 ("c12", 8, talk("c12", "Maximiliano", one(f"Close-up of {MAX} {COM}, standing on the RIGHT, a wide friendly smile, both hands open low", "LEFT",
     NODOUBLE("man in a burgundy blazer")), "friendly, smooth, a little nervous")),
 ("i1", 6, f"Close-up insert {COM}: {PLATE} on the white tablecloth; a woman's hand in a black long sleeve slowly lifts the silver spoon with mole. "
           f"That silver spoon is the only spoon in the whole shot, nothing else lies on the tablecloth. No faces, no readable words. No dialogue."),
 ("c13", 6, talk("c13", "Victoria", one(f"Close-up of {VIC} {COM}, sitting at the table in the CENTER, she tastes from a silver spoon, closes her eyes, then opens them, moved", "RIGHT"),
     "moved, sure, quiet")),
 ("c14", 6, talk("c14", "Darío", one(f"Close-up of {DAR} {COM}, standing on the RIGHT, a confident smile, his hands joined in front of him", "LEFT"),
     "confident, polite, a little nervous")),
 ("c15", 8, talk("c15", "Victoria", one(f"Close-up of {VIC} {COM}, sitting at the table in the CENTER, calm and serious, she sets the spoon down", "RIGHT"),
     "calm, serious, precise")),
 ("r2", 6, one(f"Close-up of {DAR} {COM}, standing on the RIGHT, in silence, his smile slowly disappears and he lowers his eyes", "LEFT") + " Slow push-in. No dialogue."),
 # QA P1 c16: la 2ª frase ("Mejor pruebe el postre.") salió quemada como subtítulo -> se refuerza que ninguna frase se escribe
 ("c16", 8, talk("c16", "Maximiliano", one(f"Close-up of {MAX} {COM}, standing on the RIGHT, a small nervous smile, both hands open in front of his chest", "LEFT",
     "no subtitles at any moment, not even for his last short sentence; the lower part of the frame shows only his blazer and the room"), "smooth, nervous, quick")),
 ("c17", 10, talk("c17", "Concha", one(f"Close-up of {CON} {COM}, standing on the LEFT by the kitchen doorway, {APRON}, calm and dignified, a small proud smile", "RIGHT",
     NODOUBLE("woman in a white embroidered blouse")), "calm, sure, dignified")),
 ("c18", 8, talk("c18", "Victoria", one(f"Close-up of {VIC} {COM}, sitting at the table in the CENTER, she turns her head to the LEFT, surprised, then worried", "LEFT"),
     "surprised, worried, warm")),
 ("c19", 8, talk("c19", "Toño", one(f"Close-up of {TON} {COM}, standing on the LEFT by the kitchen doorway, nervous but brave, his hands open", "RIGHT"),
     "nervous, brave, honest")),
 ("r3", 6, one(f"Close-up of {MAX} {COM}, standing on the RIGHT, in silence, his smile slowly disappears and he lowers his eyes", "LEFT") + " Slow push-in. No dialogue."),
 # 4. El giro de poder
 ("c20", 8, talk("c20", "Victoria", one(f"Close-up of {VIC} {COM}, sitting at the table in the CENTER, she turns her head to the RIGHT, firm and disappointed", "RIGHT"),
     "firm, disappointed, slow")),
 ("c21", 8, talk("c21", "Maximiliano", one(f"Close-up of {MAX} {COM}, standing on the RIGHT, upset, his jaw tight, hands open low", "LEFT"),
     "upset, low, defensive")),
 ("c22", 8, talk("c22", "Victoria", one(f"Close-up of {VIC} {COM}, sitting at the table in the CENTER, firm and calm, she nods once", "RIGHT"),
     "firm, calm, final")),
 ("c23", 8, talk("c23", "Victoria", one(f"Close-up of {VIC} {COM}, sitting at the table in the CENTER, calm, a tiny serious smile, her head turned a little more to the RIGHT", "RIGHT"),
     "calm, dry, final")),
 ("c24", 6, talk("c24", "Darío", one(f"Close-up of {DAR} {COM}, standing on the RIGHT, humble, his hands joined in front of him, he lowers his eyes, then looks up", "LEFT"),
     "humble, quiet, sincere")),
 # 5. Payoff en la cocina (cama cálida): Concha vuelve a su estufa (Concha IZQ., Victoria DER., Toño CENTRO)
 ("c25", 6, talk("c25", "Concha", one(f"Close-up of {CON} {COC}, standing on the LEFT by the stove with {POT}, wearing her dark green apron again, eyes shining, a grateful smile", "RIGHT"),
     "moved, grateful, warm")),
 ("c26", 6, talk("c26", "Victoria", one(f"Close-up of {VIC} {COC}, standing on the RIGHT, a warm smile, she nods", "LEFT"),
     "warm, kind, proud")),
 ("c27", 6, talk("c27", "Toño", one(f"Close-up of {TON} {COC}, standing in the CENTER by the stove, a big happy smile, one open hand toward the stove", "LEFT"),
     "happy, warm, playful")),
 # 6. Gancho para la Parte 2 (callejón de noche: Maximiliano IZQ., Darío DER.)
 ("c28", 10, talk("c28", "Maximiliano", one(f"Close-up of {MAX} {CALN}, standing on the LEFT in the shadows, a cold quiet smile, he glances toward the back door", "RIGHT",
     NODOUBLE("man in a burgundy blazer")), "cold, quiet, menacing")),
 ("c29", 6, talk("c29", "Darío", one(f"Close-up of {DAR} {CALN}, standing on the RIGHT, worried, he rubs the back of his neck", "LEFT"),
     "worried, low, unsure")),
 ("c30", 8, talk("c30", "Maximiliano", one(f"Close-up of {MAX} {CALN}, standing on the LEFT, a cold smile, he leans a little closer and lowers his voice", "RIGHT"),
     "cold, low, sure")),
 ("r4", 6, one(f"Close-up of {DAR} {CALN}, standing on the RIGHT, in silence, he stays very still, his eyes open wide, thinking", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Concha en su cocina junto a la cazuela, a cámara
 ("c31", 10, talk("c31", "Concha", f"Medium close-up of {CON} {COC}, alone, standing beside {POT} on the stove, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she stirs the mole slowly with one wooden spoon, smooths her apron, nods, tilts her head, raises her eyebrows and smiles. "
     f"The kitchen behind her is empty, no other people; one single wooden spoon.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"), ("commanding", "firm"),
        ("ashamed", "humble"), ("stammering", "quiet"), ("fake polite", "polite"), ("forced", "small"), ("eyes wide", "eyes open"), ("eyes open wide", "eyes open"),
        ("jaw tight", "serious face"), ("swallows", "breathes"), ("hurt", "sad"), ("in the shadows", "in soft light"), ("deep shadows", "soft shadows"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("nervous", "quiet"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("defeated", "quiet"), ("wrinkles his nose", "raises his eyebrows"),
        ("¡", ""), ("!", "."), ("como si no valiera nada", "sin pensarlo"), ("que nadie la vea", "sin hacer ruido"),
        ("para que nadie la viera", "sin hacer ruido"), ("va a saber a pura sal", "no va a salir igual")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican restaurant house, warm soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family restaurant drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{CONCEPCION_MOLERA}", "a Mexican cook"), ("@{MAXIMILIANO_GERENTE}", "a Mexican restaurant manager"),
         ("@{DARIO_COCINERO}", "a Mexican cook"), ("@{ANTONIO_LAVALOZA}", "a Mexican kitchen helper"),
         ("@{VICTORIA_LAZCANO}", "a Mexican restaurant owner"), ("@{PROP_CAZUELAMOLE}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END y NOSUB quedan, van después del diálogo)
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
