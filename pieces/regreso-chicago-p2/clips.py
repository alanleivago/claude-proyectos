"""Genera los clips de regreso-chicago PARTE 2 (La Casa de Chicago) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2: subtítulos quemados -> se agrega al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# Hojas de la Parte 1 revisadas en hoja de contactos (cada nombre es su persona/lugar, md5 distintos y sin coincidencias con otras piezas):
# ROGELIO, YESENIA, ULISES, REBECA, JOSEFINA, LOC_FACHADA, LOC_COCHERA. Ninguna hoja nueva.
# PROP_CARPETA no se usa: la hoja trae una etiqueta escrita ("PROP REF 4C") -> la carpeta va descrita en texto, cerrada, sin papeles a la vista.
# QA padre-veladoras-p2 / agua-hacienda-p2: con alguien de espaldas en el borde, la cámara se corre y queda un sombrero/cuerpo flotando, y en canasta P1 c12
# la Refugio del borde se convirtió en otra mujer -> SOLO primeros planos limpios de una persona (SOLO), mirando al otro fuera de cuadro. Nada de over-the-shoulder.
# Geografía fija:
#   Fachada (c01-c09, c13-c29): la casa y la reja verde a la IZQUIERDA con Yesenia, Rebeca y Ulises; Rogelio y Josefina a la DERECHA en la banqueta empedrada.
#   Cochera (c10-c12, r2, r3): la camioneta blanca y Ulises a la IZQUIERDA; Yesenia y Rogelio a la DERECHA, en la entrada de la cochera.
FAC = ("in front of the mustard-yellow colonial house @{LOC_FACHADA} on a cobblestone street in Guanajuato, a dark green wrought-iron gate, "
       "a Virgin of Guadalupe tile niche on the wall, warm golden-hour light; no extras, nobody else on the street")
COC = ("at the open garage @{LOC_COCHERA} of the same mustard-yellow colonial house, one single new white pickup truck parked inside, terracotta floor, "
       "dark green wrought-iron gate, warm golden-hour light; no extras, nobody else in the garage")
# Anclas de identidad y ropa (las de la Parte 1). QA P1 c03/c18/c23: Ulises con pantalón azul o jeans -> beige chino siempre. QA P1 c13: Rebeca señaló con el dedo -> manos bajas.
ROG = ("@{ROGELIO} (42-year-old man, short black hair greying at the temples, short black goatee and moustache, black denim jacket over a mustard-yellow t-shirt, "
       "olive green canvas crossbody bag, his hands open and kept low)")
YES = ("@{YESENIA} (38-year-old woman, long wavy dark brown hair with caramel highlights, big gold hoop earrings, thick gold chain, "
       "black blazer over an emerald green satin blouse, black trousers)")
ULI = ("@{ULISES} (36-year-old man, short slicked-back black hair, clean-shaven with no beard and no moustache, royal blue polo shirt with a white collar trim, "
       "sunglasses hooked on the collar, gold wristwatch, beige chino trousers, brown leather loafers, never jeans or dark trousers)")
REB = ("@{REBECA} (60-year-old woman, short dyed platinum-blonde hair, pearl earrings, black-and-white zebra-print blouse, burgundy cardigan, "
       "her hands kept low, she never points a finger at anyone)")
JOS = "@{JOSEFINA} (68-year-old woman, long grey braid, navy blue rebozo shawl over her shoulders, white blouse with red embroidered flowers, dark brown skirt)"
# QA padre-veladoras-p2 (MEDAL) / medalla-mezcal-p2 (dos sombreros) / chocolate-rancho-p2 (sobres lacrados): utilería duplicada o inventada -> cada objeto, uno solo
FOLDER = "one single closed light blue cardboard folder held against her chest, no envelope, no wax seal, no loose papers"
CASE = "one single black rolling suitcase"
TRUCK = "the one single white pickup truck"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
look = lambda who, side: f"{SOLO}, looking at {who} off-screen to the {side}"
# QA P2 v1: c16 con un bulto oscuro (doble de Rogelio, chamarra negra) en primer plano en el borde DER. mientras habla desde 0.0, y c11 con DOS camionetas
# (puerta abierta flotando adelante + otra camioneta detrás) -> plano de una sola persona (ONE + ALONE) y mirada a un lado SIN nombrar al otro (gaze), como camionero v2.
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. Sigue del cliffhanger en la reja ("Aquí la que se va eres tú." / "Gracias, amá.") — Rogelio hablando desde el frame 0, recap en 1 frase
 ("c01", 10, talk("c01", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT on the cobblestone sidewalk, tired but firm, {look('Yesenia', 'LEFT')}.",
     "low, firm, controlled")),
 ("c02", 8, talk("c02", "Yesenia", f"Close-up of {YES} {FAC}, standing on the LEFT just inside the open dark green iron gate, chin up, arms crossed, {look('Rogelio', 'RIGHT')}.",
     "cold, arrogant, defiant")),
 ("c03", 8, talk("c03", "Josefina", f"Close-up of {JOS} {FAC}, standing on the RIGHT on the sidewalk, {FOLDER}, serene, {look('Yesenia', 'LEFT')}.",
     "calm, firm, dignified")),
 ("c04", 8, talk("c04", "Rebeca", f"Close-up of {REB} {FAC}, standing on the LEFT at the open iron gate, proud, {look('Josefina', 'RIGHT')}.",
     "sharp, proud, unhurried, every word clearly pronounced")),
 ("c05", 8, talk("c05", "Josefina", f"Close-up of {JOS} {FAC}, standing on the RIGHT, {FOLDER}, a small knowing smile, {look('Rebeca', 'LEFT')}.",
     "calm, ironic, slow")),
 ("r1", 6, f"Close-up of {ULI} {FAC}, standing on the LEFT at the open iron gate, in silence, he lowers his eyes and touches the sunglasses on his collar, uncomfortable; {SOLO}. Slow push-in. No dialogue."),
 ("c06", 8, talk("c06", "Ulises", f"Close-up of {ULI} {FAC}, standing on the LEFT at the gate, a nervous smile, both hands open and low, {look('Josefina', 'RIGHT')}.",
     "nervous, fake friendly, fast")),
 ("c07", 8, talk("c07", "Yesenia", f"Close-up of {YES} {FAC}, standing on the LEFT at the gate, she turns her head to Ulises beside her off-screen, surprised and hurt; {SOLO}.",
     "surprised, hurt, disbelieving")),
 ("c08", 8, talk("c08", "Ulises", f"Close-up of {ULI} {FAC}, standing on the LEFT, he shrugs and glances at Yesenia beside him off-screen; {SOLO}.",
     "relaxed, cold, a little mocking")),
 ("c09", 8, talk("c09", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT, a small bitter smile, {look('Ulises', 'LEFT')}.",
     "calm, ironic, bitter")),
 # 2. La camioneta (cochera: camioneta y Ulises IZQUIERDA; Yesenia y Rogelio DERECHA en la entrada)
 ("r2", 6, f"Medium shot {COC}: {ULI} walks quickly into the garage on the LEFT toward {TRUCK} and opens the driver's door, holding one car key. Only this one character appears in the whole shot, exactly once. Slow push-in. No dialogue."),
 ("c10", 8, talk("c10", "Yesenia", f"Close-up of {YES} {COC}, standing on the RIGHT at the garage entrance, her eyes wide, {look('Ulises', 'LEFT')}.",
     "upset, surprised, fast")),
 ("c11", 8, talk("c11", "Ulises", f"Close-up of {ULI} {COC}, standing on the LEFT in front of {TRUCK}, one hand resting on its hood, a confident smile, {gaze('RIGHT')}; {ONE}; {ALONE}; the truck behind him is the only vehicle in the shot, all its doors closed, no second truck and no loose car door anywhere.",
     "confident, smug, relaxed")),
 ("c12", 8, talk("c12", "Rogelio", f"Close-up of {ROG} {COC}, standing on the RIGHT at the garage entrance, calm and sad, {look('Ulises', 'LEFT')}.",
     "calm, sad, firm")),
 ("r3", 6, f"Medium shot {COC}: {TRUCK} drives slowly out of the garage onto the cobblestone street, {ULI} at the wheel seen through the windshield. Only this one character appears in the whole shot. Slow push-in. No dialogue."),
 # 3. Yesenia se queda sola (fachada)
 ("c13", 8, talk("c13", "Rebeca", f"Close-up of {REB} {FAC}, standing on the LEFT at the gate, she turns her head to her daughter beside her off-screen, annoyed; {SOLO}.",
     "sharp, annoyed, mocking")),
 ("c14", 8, talk("c14", "Yesenia", f"Close-up of {YES} {FAC}, standing on the LEFT at the gate, her voice softer, eyes shining, {look('Rogelio', 'RIGHT')}.",
     "tired, then soft and pleading")),
 ("c15", 8, talk("c15", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT, he raises his eyebrows, {look('Yesenia', 'LEFT')}.",
     "calm, ironic, hurt")),
 ("c16", 8, talk("c16", "Yesenia", f"Close-up of {YES} {FAC}, standing on the LEFT, chin up again, {gaze('RIGHT')}; {ONE}; {ALONE}; no man in a black jacket anywhere.",
     "defensive, bitter")),
 ("c17", 8, talk("c17", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT, his eyes shine, his voice low, {look('Yesenia', 'LEFT')}.",
     "quiet, hurt, slow")),
 ("r4", 6, f"Close-up of {YES} {FAC}, standing on the LEFT at the gate, in silence, she lowers her eyes, her eyes shine and she swallows; {SOLO}. Slow push-in. No dialogue."),
 ("c18", 8, talk("c18", "Josefina", f"Close-up of {JOS} {FAC}, standing on the RIGHT, {FOLDER}, kind and firm, {look('Yesenia', 'LEFT')}.",
     "calm, kind, firm")),
 ("c19", 8, talk("c19", "Yesenia", f"Close-up of {YES} {FAC}, standing on the LEFT at the gate, she takes a breath and nods once, proud, {look('Josefina', 'RIGHT')}.",
     "quiet, proud, defeated")),
 # 4. La maleta (espejo de la Parte 1) + recompensa (cama cálida desde c20)
 ("r5", 6, f"Medium shot {FAC}: {YES} comes out through the open dark green iron gate on the LEFT pulling {CASE} and stops on the cobblestone sidewalk. Only this one character appears in the whole shot, exactly once. Slow push-in. No dialogue."),
 ("c20", 8, talk("c20", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT, calm, a serene look, {look('Yesenia', 'LEFT')}.",
     "calm, serene, dignified")),
 ("c21", 6, talk("c21", "Yesenia", f"Close-up of {YES} {FAC}, standing on the LEFT on the sidewalk, one hand on the handle of {CASE}, eyes shining, {look('Rogelio', 'RIGHT')}.",
     "quiet, sad, proud")),
 ("c22", 8, talk("c22", "Josefina", f"Close-up of {JOS} {FAC}, standing on the RIGHT, {FOLDER}, a warm proud smile, she looks at her son beside her off-screen; {SOLO}.",
     "warm, proud, soft")),
 ("c23", 8, talk("c23", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT, eyes shining, a warm smile, he looks at his mother beside him off-screen; {SOLO}.",
     "warm, grateful, a little playful")),
 # 5. Gancho nuevo: Rebeca no se va (suspenso desde c24)
 ("c24", 6, talk("c24", "Rebeca", f"Close-up of {REB} {FAC}, standing on the LEFT at the open gate, calm and serious, {look('Josefina', 'RIGHT')}.",
     "calm, cold, slow")),
 ("c25", 8, talk("c25", "Josefina", f"Close-up of {JOS} {FAC}, standing on the RIGHT, {FOLDER}, surprised, {look('Rebeca', 'LEFT')}.",
     "surprised, firm")),
 ("c26", 10, talk("c26", "Rebeca", f"Close-up of {REB} {FAC}, standing on the LEFT at the gate, a cold small smile, {look('Josefina', 'RIGHT')}.",
     "cold, slow, every word clearly pronounced")),
 ("r6", 6, f"Close-up of {JOS} {FAC}, standing on the RIGHT, in silence, her smile slowly disappears and she holds the folder closer to her chest, {FOLDER}; {SOLO}. Slow push-in. No dialogue."),
 ("c27", 8, talk("c27", "Rogelio", f"Close-up of {ROG} {FAC}, standing on the RIGHT, he glances at his mother beside him off-screen, then to the LEFT, confused; {SOLO}.",
     "confused, worried")),
 ("c28", 8, talk("c28", "Josefina", f"Close-up of {JOS} {FAC}, standing on the RIGHT, {FOLDER}, her voice low, she looks at her son beside her off-screen; {SOLO}.",
     "very low, serious, slow")),
 ("r7", 6, f"Close-up of {REB} {FAC}, standing on the LEFT at the gate, in silence, a slow knowing smile; {SOLO}. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK), en la fachada como el CTA de la Parte 1
 ("c29", 10, talk("c29", "Rogelio", f"Close-up of {ROG} {FAC}, alone, looking straight into the camera and talking to the viewer from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he adjusts the strap of his bag, nods, tilts his head, smiles and gestures with one open hand. The street behind him is empty, no other people.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("walks quickly", "walks")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"),
        ("mocking", "playful"), ("bitter", "sad"), ("hurt", "sad"), ("defeated", "calm"), ("pleading", "soft"), ("fake friendly", "friendly"),
        ("nervous", "quiet"), ("cold", "serious"), ("ironic", "calm"), ("arrogant", "proud"), ("defiant", "firm"), ("eyes wide", "eyes open"),
        ("upset", "surprised"), ("uncomfortable", "quiet"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"),
        ("¡", ""), ("!", "."), ("lo que usted me quitó hace treinta años", "lo que pasó hace treinta años"),
        ("qué creen que le quitó mi mamá a doña Rebeca", "qué creen que pasó entre mi mamá y doña Rebeca")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial Mexican street, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{ULISES}", "a Mexican man"), ("@{REBECA}", "a Mexican woman"), ("@{YESENIA}", "a Mexican woman"), ("@{JOSEFINA}", "an elderly Mexican woman")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (NOSUB queda, va después del diálogo)
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
    print("FIN P2", flush=True)

if __name__ == "__main__":
    main()
