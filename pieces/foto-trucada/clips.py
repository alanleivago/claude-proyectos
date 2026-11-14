"""Genera los clips de foto-trucada PARTE 1 (La Foto que No Era, historia propia inspirada en la ref 7691753795893710100 de @eltiomoet, MEXI) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
#   Calle, escena 1 (c01-c03): Ernesto a la DERECHA en la puerta de su casa; Norma a la IZQUIERDA con su maleta.
#   Calle, escenas 2 y 6 (c04-c06, c16-c18): Norma a la IZQUIERDA; Rocío a la DERECHA, frente a su cochera.
#   Cocina de Karla (c07-c09, r1, c19-c22, r3): Karla a la IZQUIERDA; Norma a la DERECHA, sentada a la mesa.
#   Calle, escena 4 (c10-c12, r2): Rocío a la IZQUIERDA; Hugo a la DERECHA.
#   Costura de Rocío (c13-c15): Rocío a la IZQUIERDA junto a su máquina; Clotilde a la DERECHA.
#   Calle de noche (c23-c27, r4): Karla a la IZQUIERDA; Rocío a la DERECHA, junto a dos cajas de cartón.
#   c28: Norma sola en la esquina de la calle de noche, mira a la DERECHA hacia ellas. CTA (c29): Karla sola en la calle de noche, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin letreros, sin números, sin marcas, sin adornos.
CAL = ("on the street @{LOC_CALLECOLONIA} of a working-class neighborhood in a Mexican city on a sunny day: two plain two-story houses side by side, "
       "one pale green house with a brown metal door, one peach house with an open garage, a plain grey sidewalk; soft daylight; "
       "no readable text, no house numbers, no signs, no logos; no extras, nobody else on the street besides the person described")
CALN = CAL.replace("on a sunny day", "at night").replace("soft daylight", "warm light from one street lamp, soft dark shadows").replace(
       "a plain grey sidewalk", "a plain grey sidewalk with two plain brown cardboard boxes by the garage")
COC = ("in the small apartment kitchen @{LOC_DEPAKARLA} in the evening: a plain white tiled wall, one small wooden table with two chairs, one window with a plain beige curtain; "
       "warm evening lamp light; no readable text, no signs, no logos, no calendar; "
       "no extras, nobody else in the kitchen besides the person described")
COS = ("inside the small sewing workshop @{LOC_COSTURAROCIO} set in a garage: plain whitewashed walls, one black sewing machine on a wooden table, "
       "one plain metal rack with a few dresses on hangers; daylight from the open garage door; no mirror, no readable text, no signs, no logos; "
       "no extras, nobody else in the workshop besides the person described")
# Anclas de identidad y ropa (atuendos de la ref con otros colores: la chismosa de delantal sucio -> blusa fucsia de lunares y pelo rojizo de permanente;
# el marido de camisa manchada -> camisa de franela café; la vecina inocente -> costurera de blusa mostaza con cinta métrica; la hija -> adulta de 25 con chamarra de mezclilla negra).
# NADIE lleva sombrero, gorra ni lentes. Manos abiertas, nadie señala con el dedo. Sin uniformes, gafetes ni letras en la ropa.
# Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
NOR = ("@{NORMA_BECERRIL} (54-year-old Mexican woman, light brown skin, sharp gossipy face with thin plucked eyebrows, short curly permed burgundy red hair, big gold hoop earrings, "
       "no hat, no glasses, fuchsia blouse with small white polka dots, black trousers, her hands kept low, she never points a finger at anyone)")
ERN = ("@{ERNESTO_BECERRIL} (58-year-old Mexican man, tan skin, tired stern face, short grey hair, thick grey mustache, no hat, no glasses, "
       "brown plaid flannel shirt with sleeves rolled up, jeans, his hands kept low)")
ROC = ("@{ROCIO_MONTIEL} (34-year-old Mexican woman, brown skin, kind honest face, long wavy chestnut hair worn loose, no hat, no glasses, "
       "mustard yellow blouse, a yellow tailor's measuring tape hanging around her neck, light blue jeans, her hands kept low)")
HUG = ("@{HUGO_MONTIEL} (37-year-old Mexican man, brown skin, serious hurt face, short black hair, short black beard, no hat, no glasses, "
       "plain navy blue polo shirt with no logo, grey work trousers, his hands kept low)")
KAR = ("@{KARLA_BECERRIL} (25-year-old Mexican woman, clearly an adult, light brown skin, thoughtful face, black hair in a high bun, small gold stud earrings, no hat, no glasses, "
       "black denim jacket over a plain white t-shirt, dark jeans, her hands kept low)")
CLO = ("@{CLOTILDE_RAMOS} (62-year-old Mexican woman, fair skin, prim uneasy face, short grey hair, small pearl earrings, no hat, no glasses, "
       "rose pink cardigan over a white blouse, one folded plain blue dress held against her chest, her hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
SUITCASE = "one old brown suitcase standing on the ground beside her"
PHONE = "one black smartphone held low in her RIGHT hand, its screen turned away from the camera"
PHONEH = "one black smartphone held low in his RIGHT hand, its screen turned away from the camera"
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
 # 1. Gancho (calle, día): Ernesto ya está hablando desde el frame 0 (sin plano abierto)
 ("c01", 8, talk("c01", "Ernesto", one(f"Close-up of {ERN} {CAL}, standing on the RIGHT in the doorway of the pale green house, fed up and stern", "LEFT",
     NODOUBLE("man in a plaid flannel shirt")), "fed up, stern, firm")),
 ("c02", 8, talk("c02", "Norma", one(f"Close-up of {NOR} {CAL}, standing on the LEFT, {SUITCASE}, offended and surprised", "RIGHT",
     NODOUBLE("woman in a fuchsia blouse")), "offended, indignant, surprised")),
 ("c03", 8, talk("c03", "Ernesto", one(f"Close-up of {ERN} {CAL}, standing on the RIGHT in the doorway of the pale green house, tired, he shakes his head", "LEFT"),
     "tired, firm, disappointed")),
 # 2. Culpa a la vecina (calle, día)
 ("c04", 6, talk("c04", "Norma", one(f"Close-up of {NOR} {CAL}, standing on the LEFT, {SUITCASE}, a bitter fake smile", "RIGHT"),
     "bitter, sarcastic, resentful")),
 ("c05", 8, talk("c05", "Rocío", one(f"Close-up of {ROC} {CAL}, standing on the RIGHT in front of the open garage of the peach house, confused and calm", "LEFT",
     NODOUBLE("woman in a mustard blouse")), "confused, calm, honest")),
 ("c06", 8, talk("c06", "Norma", one(f"Close-up of {NOR} {CAL}, standing on the LEFT, {SUITCASE}, she narrows her eyes, a cold smile", "RIGHT"),
     "cold, menacing, smug")),
 # 3. El encargo (cocina de Karla, noche): Norma pide la foto
 ("c07", 6, talk("c07", "Karla", one(f"Close-up of {KAR} {COC}, standing on the LEFT, she sighs, patient", "RIGHT",
     NODOUBLE("woman in a black denim jacket")), "patient, tired, warm")),
 ("c08", 8, talk("c08", "Norma", one(f"Close-up of {NOR} {COC}, sitting on the RIGHT at the small table, {PHONE}, a sweet innocent smile", "LEFT",
     NODOUBLE("woman in a fuchsia blouse")), "sweet, innocent, playful")),
 ("c09", 6, talk("c09", "Karla", one(f"Close-up of {KAR} {COC}, standing on the LEFT, she rolls her eyes and smiles a little", "RIGHT"),
     "amused, a little annoyed, warm")),
 ("r1", 6, one(f"Close-up of {NOR} {COC}, sitting on the RIGHT at the small table, in silence, a slow sly smile spreads on her face", "LEFT") + " Slow push-in. No dialogue."),
 # 4. La foto en el grupo (calle, día): Hugo con el celular
 ("c10", 8, talk("c10", "Hugo", one(f"Close-up of {HUG} {CAL}, standing on the RIGHT in front of the peach house, {PHONEH}, hurt and shocked", "LEFT",
     NODOUBLE("man in a navy polo shirt")), "hurt, shocked, quiet")),
 ("c11", 8, talk("c11", "Rocío", one(f"Close-up of {ROC} {CAL}, standing on the LEFT, desperate, her eyes shine", "RIGHT",
     NODOUBLE("woman in a mustard blouse")), "desperate, pleading, honest")),
 ("c12", 6, talk("c12", "Hugo", one(f"Close-up of {HUG} {CAL}, standing on the RIGHT, he looks down, hurt, his jaw tight", "LEFT"),
     "hurt, quiet, firm")),
 ("r2", 6, one(f"Close-up of {ROC} {CAL}, standing on the LEFT, in silence, she watches someone walk away, her eyes shine", "RIGHT") + " Slow push-in. No dialogue."),
 # 5. Se va la clienta (costura de Rocío)
 ("c13", 8, talk("c13", "Clotilde", one(f"Close-up of {CLO} {COS}, standing on the RIGHT, uneasy, she avoids eye contact", "LEFT",
     NODOUBLE("woman in a rose pink cardigan")), "uneasy, embarrassed, quiet")),
 ("c14", 6, talk("c14", "Rocío", one(f"Close-up of {ROC} {COS}, standing on the LEFT by the sewing machine, pleading and calm", "RIGHT"),
     "pleading, calm, sad")),
 ("c15", 6, talk("c15", "Clotilde", one(f"Close-up of {CLO} {COS}, standing on the RIGHT, she lowers her eyes, sorry", "LEFT"),
     "sorry, uneasy, quiet")),
 # 6. Norma presume (calle, día)
 ("c16", 6, talk("c16", "Norma", one(f"Close-up of {NOR} {CAL}, standing on the LEFT, a mocking sweet smile", "RIGHT",
     NODOUBLE("woman in a fuchsia blouse")), "mocking, sweet, smug")),
 ("c17", 6, talk("c17", "Rocío", one(f"Close-up of {ROC} {CAL}, standing on the RIGHT in front of the open garage, firm, her eyes shine", "LEFT"),
     "firm, hurt, controlled")),
 ("c18", 6, talk("c18", "Norma", one(f"Close-up of {NOR} {CAL}, standing on the LEFT, she puts a hand on her chest, fake innocent", "RIGHT"),
     "fake innocent, sarcastic, cold")),
 # 7. Karla lo descubre (cocina de Karla, noche)
 ("c19", 8, talk("c19", "Karla", one(f"Close-up of {KAR} {COC}, standing on the LEFT, {PHONE}, she looks up from the phone, shocked", "RIGHT",
     NODOUBLE("woman in a black denim jacket")), "shocked, hurt, quiet")),
 ("c20", 6, talk("c20", "Norma", one(f"Close-up of {NOR} {COC}, sitting on the RIGHT at the small table, calm and cold, she shrugs", "LEFT"),
     "calm, cold, dismissive")),
 ("c21", 8, talk("c21", "Karla", one(f"Close-up of {KAR} {COC}, standing on the LEFT, upset, her eyes shine", "RIGHT",
     NODOUBLE("woman in a black denim jacket")), "upset, guilty, firm")),  # QA 11-07: c21 v1 bajó corrupto (no decodifica)
 ("c22", 6, talk("c22", "Norma", one(f"Close-up of {NOR} {COC}, sitting on the RIGHT at the small table, she leans forward, serious and threatening", "LEFT",
     NODOUBLE("woman in a fuchsia blouse")), "threatening, quiet, cold")),
 ("r3", 6, one(f"Close-up of {KAR} {COC}, standing on the LEFT, in silence, she lowers the black phone slowly, thinking, her jaw tight", "RIGHT") + " Slow push-in. No dialogue."),
 # 8. Punto más bajo y gancho (calle de noche): Karla busca a Rocío
 ("c23", 6, talk("c23", "Karla", one(f"Close-up of {KAR} {CALN}, standing on the LEFT, nervous, she speaks low", "RIGHT",
     NODOUBLE("woman in a black denim jacket")), "nervous, quiet, sincere")),
 ("c24", 6, talk("c24", "Rocío", one(f"Close-up of {ROC} {CALN}, standing on the RIGHT by the cardboard boxes, tired and wary, her eyes shine", "LEFT",
     NODOUBLE("woman in a mustard blouse")), "tired, wary, sad")),
 ("c25", 8, talk("c25", "Karla", one(f"Close-up of {KAR} {CALN}, standing on the LEFT, {PHONE}, urgent and sincere", "RIGHT"),
     "urgent, sincere, quiet")),
 ("c26", 6, talk("c26", "Rocío", one(f"Close-up of {ROC} {CALN}, standing on the RIGHT by the cardboard boxes, suspicious, she frowns", "LEFT"),
     "suspicious, surprised, soft")),
 ("c27", 8, talk("c27", "Karla", one(f"Close-up of {KAR} {CALN}, standing on the LEFT, a bitter guilty smile, then determined", "RIGHT"),
     "guilty, determined, quiet")),
 ("r4", 6, one(f"Close-up of {ROC} {CALN}, standing on the RIGHT by the cardboard boxes, in silence, she breathes in, a small hope appears in her shining eyes", "LEFT") + " Slow push-in. No dialogue."),
 ("c28", 6, talk("c28", "Norma", one(f"Close-up of {NOR} {CALN}, standing alone at the corner of the street, she watches from far away, worried, she narrows her eyes", "RIGHT",
     NODOUBLE("woman in a fuchsia blouse")), "suspicious, worried, quiet")),
 # CTA con carisma (después del BLACK): Karla en la calle de noche, a cámara
 ("c29", 10, talk("c29", "Karla", f"Medium close-up of {KAR} {CALN}, alone, standing, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she tucks a loose hair behind her ear, tilts her head, raises her eyebrows, nods and smiles. "
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
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("gossipy", "lively"),
        ("bitter", "serious"), ("resentful", "serious"), ("sarcastic", "dry"), ("fake innocent", "calm"), ("fake", "small"), ("offended", "surprised"),
        ("desperate", "worried"), ("pleading", "sincere"), ("guilty", "serious"), ("wary", "quiet"), ("suspicious", "curious"), ("embarrassed", "quiet"),
        ("fed up", "tired"), ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("controlled", "calm"),
        ("dismissive", "calm"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("cold", "serious"),
        ("¡", ""), ("!", "."), ("Para que esa mustia aprenda", "Para que aprenda"), ("delatar a mi mamá", "decir la verdad sobre mi mamá"),
        ("abrazada con otro hombre", "con otro señor"), ("Te me vas.", "Vete con tu hija."), ("Así que calladita.", "Mejor no digas nada.")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, neighbors in a working-class neighborhood of a Mexican city, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{NORMA_BECERRIL}", "a Mexican neighborhood woman"), ("@{ERNESTO_BECERRIL}", "a Mexican husband"),
         ("@{ROCIO_MONTIEL}", "a Mexican seamstress"), ("@{HUGO_MONTIEL}", "a Mexican man"),
         ("@{KARLA_BECERRIL}", "a Mexican woman"), ("@{CLOTILDE_RAMOS}", "an older Mexican lady"),
         (" @{LOC_CALLECOLONIA}", ""), (" @{LOC_DEPAKARLA}", ""), (" @{LOC_COSTURAROCIO}", "")]
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
